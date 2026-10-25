from pathlib import Path
import time
from backend.utils.logger import logger
from dynamic.emulator import EmulatorController
from dynamic.apk_runner import APKRunner
from dynamic.logcat_collector import LogcatCollector
from dynamic.frida_runner import FridaRunner
from dynamic.feature_builder import DynamicFeatureBuilder

def run_dynamic_analysis(apk_path: Path, package_name: str, timeout: int = 120, progress_callback=None) -> dict:
    emulator = EmulatorController()
    runner = APKRunner()
    logcat = LogcatCollector()
    frida = FridaRunner()
    builder = DynamicFeatureBuilder()

    start_time = time.time()
    
    try:
        if progress_callback:
            progress_callback("Booting Android sandbox (AVD)...", 1, 15)
        emulator.start()
        
        if progress_callback:
            progress_callback("Installing APK into sandbox environment...", 2, 35)
        runner.install(apk_path)
        logcat.start(package_name)

        if progress_callback:
            progress_callback("Launching app & initializing telemetry...", 2, 45)
        runner.launch(package_name)
        
        time.sleep(1)
        
        try:
            frida.attach(package_name)
        except Exception as e:
            logger.warning("skipping_frida", reason=str(e))
            
        if progress_callback:
            progress_callback("Profiling live execution & Frida API hooks (12s)...", 3, 65)
        time.sleep(12)
        
        if progress_callback:
            progress_callback("Extracting memory footprint & logcat telemetry...", 4, 85)
        meminfo = builder.get_meminfo(package_name)
        proc_count = builder.get_process_count()
        api_counts = frida.get_api_counts()
        raw_logcat = logcat.stop()
        logcat_counts = logcat.parse(raw_logcat)
        
        if progress_callback:
            progress_callback("Cleaning sandbox & restoring snapshot...", 4, 92)
        frida.detach()
        runner.uninstall(package_name)
        emulator.restore_snapshot()

        features = builder.build(meminfo, api_counts, logcat_counts, proc_count)
        
        return {
            "success": True,
            "feature_dict": features,
            "runtime_seconds": int(time.time() - start_time)
        }
        
    except Exception as e:
        logger.error("dynamic_analysis_failed", error=str(e))
        return {
            "success": False,
            "error": str(e),
            "feature_dict": {}
        }
