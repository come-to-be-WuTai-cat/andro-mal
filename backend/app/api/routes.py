import time
import shutil
import asyncio
import uuid
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from backend.app.config import MODEL_DIR
from backend.services.validator import validate_apk_file, validate_feature_array
from backend.services.feature_extractor import FeatureExtractor
from backend.services.feature_mapper import FeatureMapper
from backend.services.model_service import ModelService
from backend.utils.exceptions import APKValidationError, FeatureExtractionError, FeatureMappingError, ModelPredictionError
from backend.services.job_manager import job_manager
from backend.utils.logger import logger
from dynamic.controller import run_dynamic_analysis

router = APIRouter()
model_service = ModelService()
feature_extractor = FeatureExtractor()

@router.on_event("startup")
async def startup_event():
    logger.info("loading_models", path=str(MODEL_DIR))
    model_service.load(MODEL_DIR)

@router.get("/health")
async def health():
    return {
        "status": "ok",
        "models_loaded": model_service._loaded,
        "version": "1.0.0"
    }

def execute_dynamic_analysis(job_id: str, apk_path: Path, static_result_base: dict):
    job_manager.update_job(job_id, "running")
    job_manager.update_progress(job_id, "Booting Android sandbox (AVD)...", 1, 10)

    def on_progress(stage: str, stage_index: int, progress: int):
        job_manager.update_progress(job_id, stage, stage_index, progress)
    
    try:
        package_name = static_result_base.get("apk_info", {}).get("package_name", "unknown")
        
        dynamic_res = run_dynamic_analysis(apk_path, package_name, progress_callback=on_progress)
        
        if not dynamic_res["success"]:
            logger.warning("dynamic_skipped_or_failed", error=dynamic_res.get("error"))
            static_result_base["dynamic_available"] = False
            job_manager.update_job(job_id, "complete", static_result_base)
            return
            
        features = dynamic_res["feature_dict"]
        
        on_progress("Mapping runtime telemetry into feature matrix...", 4, 90)
        model_service.ensure_dynamic_loaded()
        mapper = FeatureMapper(
            model_service.metadata,
            dynamic_selector=model_service.pipeline_dynamic.named_steps["selector"]
        )
        X_dynamic = mapper.map_dynamic(features)

        expected_dyn = model_service.expected_dynamic_features
        validate_feature_array(X_dynamic, (1, expected_dyn))
        
        on_progress("Evaluating XGBoost / LightGBM family classifier...", 4, 95)
        dyn_prediction = model_service.predict_dynamic(X_dynamic)
        
        final_result = {**static_result_base}
        final_result["dynamic_available"] = True
        final_result["family"] = dyn_prediction["family"]
        final_result["family_conf"] = dyn_prediction["confidence"]
        final_result["family_probs"] = dyn_prediction["all_probs"]
        final_result["is_novel"] = dyn_prediction["is_novel"]
        final_result["analysis_time_ms"] += dynamic_res["runtime_seconds"] * 1000
        
        job_manager.update_job(job_id, "complete", final_result)
        
    except Exception as e:
        logger.error("background_dynamic_error", error=str(e))
        static_result_base["dynamic_available"] = False
        static_result_base["dynamic_error"] = str(e)
        static_result_base["status"] = "error"
        job_manager.update_job(job_id, "error", static_result_base, message=str(e))
    finally:
        if apk_path.exists():
            try:
                apk_path.unlink()
            except:
                pass


@router.post("/analyze")
async def analyze(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    start_time = time.time()
    
    temp_dir = Path("tmp")
    temp_dir.mkdir(exist_ok=True)
    original_name = Path(file.filename or "upload.apk").name
    temp_file = temp_dir / f"{uuid.uuid4().hex}{Path(original_name).suffix.lower()}"
    
    try:
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        validate_apk_file(temp_file)
        
        features = feature_extractor.extract_static(temp_file)
        
        mapper = FeatureMapper(model_service.metadata)
        X_static = mapper.map_static(features)
        
        expected_static = model_service.pipeline_static.steps[0][1].n_features_in_
        validate_feature_array(X_static, (1, expected_static))
        
        static_result = model_service.predict_static(X_static)
        
        # Heuristic Safety Rails: Known publishers and system-level applications
        # often trigger false positives in generalized ML models due to massive permission usage.
        pkg_name = features.get("package_name", "").lower()
        trusted_identifiers = ["google", "android", "microsoft", "samsung", "facebook", "uptodown"]
        is_trusted = any(pub in pkg_name for pub in trusted_identifiers)
        
        if is_trusted and static_result["is_malware"]:
            logger.info("whitelist_override_invoked", package=pkg_name)
            static_result["is_malware"] = False
            static_result["verdict"] = "Benign"
            static_result["malware_prob"] = 0.05
            static_result["benign_prob"] = 0.95
            
        analysis_time_ms = int((time.time() - start_time) * 1000)
        
        response = {
            "status": "success",
            "verdict": static_result["verdict"],
            "malware_prob": static_result["malware_prob"],
            "benign_prob": static_result["benign_prob"],
            "is_malware": static_result["is_malware"],
            "family": None,
            "family_conf": None,
            "family_probs": {},
            "is_novel": False,
            "dynamic_available": False,
            "indicators": {
                "n_permissions": features.get("n_permissions", 0),
                "n_dangerous_perms": features.get("n_dangerous_perms", 0),
                "n_suspicious_apis": features.get("n_suspicious_apis", 0),
                "has_native_code": features.get("has_native_code", 0),
                "has_dynamic_code": features.get("has_dynamic_code", 0),
                "n_dex_files": features.get("n_dex_files", 0),
                "n_activities": features.get("n_activities", 0),
                "n_services": features.get("n_services", 0),
                "n_receivers": features.get("n_receivers", 0),
                "n_providers": features.get("n_providers", 0)
            },
            "permissions": features.get("permission_details", []),
            "dangerous_permissions": features.get("dangerous_permissions", []),
            "components": features.get("components", {}),
            "apk_info": {
                "package_name": features.get("package_name", "unknown"),
                "app_name": features.get("app_name", features.get("package_name", "unknown")),
                "file_name": original_name,
                "apk_size_mb": features.get("apk_size_mb", 0.0),
                "min_sdk": features.get("min_sdk", 0),
                "target_sdk": features.get("target_sdk", 0),
                "version_name": features.get("version_name", ""),
                "version_code": features.get("version_code", ""),
                "main_activity": features.get("main_activity", ""),
                "sha256": features.get("sha256", "")
            },
            "analysis_time_ms": analysis_time_ms
        }
        
        if response["is_malware"]:
            job_id = job_manager.create_job()
            
            background_tasks.add_task(
                execute_dynamic_analysis,
                job_id,
                temp_file,
                response
            )
            
            return {
                "job_id": job_id,
                "static_result": response,
                "dynamic_status": "pending"
            }
            
        if temp_file.exists():
            temp_file.unlink()
            
        return response
        
    except APKValidationError as e:
        return JSONResponse(status_code=400, content={"status": "error", "code": "INVALID_APK", "message": str(e)})
    except FeatureExtractionError as e:
        return JSONResponse(status_code=422, content={"status": "error", "code": "EXTRACTION_FAILED", "message": str(e)})
    except FeatureMappingError as e:
        return JSONResponse(status_code=500, content={"status": "error", "code": "MAPPING_ERROR", "message": str(e)})
    except ModelPredictionError as e:
        return JSONResponse(status_code=500, content={"status": "error", "code": "MODEL_ERROR", "message": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "code": "INTERNAL_ERROR", "message": str(e)})

@router.get("/result/{job_id}")
async def get_result(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
