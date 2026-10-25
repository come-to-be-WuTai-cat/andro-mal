import hashlib
from pathlib import Path
from backend.utils.exceptions import FeatureExtractionError
from androguard.core.apk import APK
from backend.utils.logger import logger

class FeatureExtractor:
    @staticmethod
    def _sha256(file_path: Path) -> str:
        digest = hashlib.sha256()
        with file_path.open("rb") as apk_file:
            for chunk in iter(lambda: apk_file.read(1024 * 1024), b""):
                digest.update(chunk)
        return digest.hexdigest()

    def extract_static(self, file_path: Path) -> dict:
        try:
            apk_size_bytes = file_path.stat().st_size
            app = APK(str(file_path))
            if not app.is_valid_APK():
                raise FeatureExtractionError("APK manifest is not valid binary Android XML")
            
            permissions = sorted(app.get_permissions())
            n_permissions = len(permissions)

            permission_metadata = app.get_details_permissions()
            permission_details = []
            dangerous_permissions = []
            for permission in permissions:
                details = permission_metadata.get(permission, [])
                protection_level = str(details[0]) if details else "unknown"
                label = str(details[1]) if len(details) > 1 else ""
                description = str(details[2]) if len(details) > 2 else ""
                is_dangerous = "dangerous" in protection_level.lower()
                if is_dangerous:
                    dangerous_permissions.append(permission)
                permission_details.append({
                    "name": permission,
                    "protection_level": protection_level,
                    "label": label,
                    "description": description,
                    "risk": "high" if is_dangerous else "info",
                })

            n_dangerous_perms = len(dangerous_permissions)
            
            activities = app.get_activities()
            services = app.get_services()
            receivers = app.get_receivers()
            providers = app.get_providers()
            
            n_suspicious_apis = 0
            
            files = app.get_files()
            has_native_code = 1 if any(f.endswith('.so') for f in files) else 0
            dex_files = [f for f in files if f.endswith('.dex')]
            has_dynamic_code = 1 if len(dex_files) > 1 else 0
            
            features = {
                "n_activities": len(activities),
                "n_services": len(services),
                "n_receivers": len(receivers),
                "n_providers": len(providers),
                "n_permissions": n_permissions,
                "n_dangerous_perms": n_dangerous_perms,
                "n_suspicious_apis": n_suspicious_apis,
                "has_native_code": has_native_code,
                "has_dynamic_code": has_dynamic_code,
                "n_dex_files": len(dex_files),
                "apk_size_bytes": float(apk_size_bytes),
                "apk_size_mb": apk_size_bytes / 1e6,
                "min_sdk": int(app.get_min_sdk_version() or 0),
                "target_sdk": int(app.get_target_sdk_version() or 0),
                "package_name": app.get_package(),
                "app_name": app.get_app_name() or app.get_package(),
                "version_name": app.get_androidversion_name() or "",
                "version_code": app.get_androidversion_code() or "",
                "main_activity": app.get_main_activity() or "",
                "sha256": self._sha256(file_path),
                "permissions_list": list(permissions),
                "dangerous_permissions": dangerous_permissions,
                "permission_details": permission_details,
                "components": {
                    "activities": activities,
                    "services": services,
                    "receivers": receivers,
                    "providers": providers,
                },
            }
            logger.info("static_extraction_complete", package=features["package_name"])
            return features
            
        except Exception as e:
            logger.error("static_extraction_failed", error=str(e))
            raise FeatureExtractionError(f"Failed to extract features from APK: {str(e)}")
