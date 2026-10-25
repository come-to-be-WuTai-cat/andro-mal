import subprocess
import time
from backend.utils.logger import logger

class LogcatCollector:
    def __init__(self):
        self.process = None

    def start(self, package_name: str) -> None:
        try:
            subprocess.run(["adb", "logcat", "-c"], capture_output=True)
            self.process = subprocess.Popen(
                ["adb", "logcat", "-v", "time"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            logger.info("logcat_started", package=package_name)
        except Exception as e:
            logger.error("logcat_start_failed", error=str(e))

    def stop(self) -> str:
        if not self.process:
            return ""
        
        self.process.terminate()
        try:
            outs, _ = self.process.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            self.process.kill()
            outs, _ = self.process.communicate()
            
        self.process = None
        return outs

    def parse(self, raw_logcat: str) -> dict:
        counts = {
            "Logcat_total": 0,
            "Logcat_verbose": 0,
            "Logcat_debug": 0,
            "Logcat_info": 0,
            "Logcat_warning": 0,
            "Logcat_error": 0,
            "Logcat_fatal": 0,
            "Logcat_silent": 0,
        }
        
        for line in raw_logcat.splitlines():
            if not line.strip():
                continue
            counts["Logcat_total"] += 1
            if " V/" in line: counts["Logcat_verbose"] += 1
            elif " D/" in line: counts["Logcat_debug"] += 1
            elif " I/" in line: counts["Logcat_info"] += 1
            elif " W/" in line: counts["Logcat_warning"] += 1
            elif " E/" in line: counts["Logcat_error"] += 1
            elif " F/" in line: counts["Logcat_fatal"] += 1
            elif " S/" in line: counts["Logcat_silent"] += 1
            
        return counts
