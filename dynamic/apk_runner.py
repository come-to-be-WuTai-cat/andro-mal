import subprocess
from pathlib import Path
from backend.utils.logger import logger

class APKRunner:
    def install(self, apk_path: Path) -> str:
        try:
            result = subprocess.run(["adb", "install", "-r", str(apk_path)], capture_output=True, text=True, check=True)
            logger.info("apk_installed", output=result.stdout.strip())
            return ""
        except subprocess.CalledProcessError as e:
            logger.error("apk_install_failed", error=e.stderr)
            raise RuntimeError(f"ADB install failed: {e.stderr}")

    def launch(self, package_name: str) -> None:
        try:
            subprocess.run(
                ["adb", "shell", "monkey", "-p", package_name, "-c", "android.intent.category.LAUNCHER", "1"],
                capture_output=True, check=True
            )
            logger.info("apk_launched", package=package_name)
        except subprocess.CalledProcessError as e:
            logger.error("apk_launch_failed", error=e.stderr)

    def uninstall(self, package_name: str) -> None:
        try:
            subprocess.run(["adb", "shell", "pm", "uninstall", package_name], capture_output=True)
            logger.info("apk_uninstalled", package=package_name)
        except Exception as e:
            logger.warning("apk_uninstall_failed", error=str(e))
