import subprocess
import time
from backend.utils.exceptions import EmulatorError
from backend.utils.logger import logger

class EmulatorController:
    AVD_NAME = "malware_sandbox"
    BOOT_TIMEOUT = 300

    def start(self) -> None:
        try:
            if self.is_running():
                logger.info("emulator_already_running")
                return

            # Launch emulator from clean snapshot if available for instant warm boot
            cmd = ["emulator", "-avd", self.AVD_NAME, "-no-window", "-no-audio", "-gpu", "host", "-snapshot", "clean"]
            subprocess.Popen(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            start_time = time.time()
            while time.time() - start_time < self.BOOT_TIMEOUT:
                result = subprocess.run(
                    ["adb", "shell", "getprop", "sys.boot_completed"],
                    capture_output=True, text=True
                )
                if result.stdout.strip() == "1":
                    logger.info("emulator_booted", duration=time.time() - start_time)
                    time.sleep(5)
                    return
                time.sleep(3)
                
            raise EmulatorError(f"Emulator boot timed out after {self.BOOT_TIMEOUT}s")
        except Exception as e:
            raise EmulatorError(f"Failed to start emulator: {str(e)}")

    def stop(self) -> None:
        try:
            subprocess.run(["adb", "emu", "kill"], capture_output=True)
            time.sleep(2)
        except Exception as e:
            logger.error("emulator_stop_failed", error=str(e))

    def is_running(self) -> bool:
        result = subprocess.run(["adb", "devices"], capture_output=True, text=True)
        lines = result.stdout.split('\n')[1:]
        return any('emulator' in line and 'device' in line for line in lines)

    def restore_snapshot(self, snapshot="clean") -> None:
        try:
            subprocess.run(
                ["adb", "emu", "avd", "snapshot", "load", snapshot],
                capture_output=True, check=True
            )
            logger.info("emulator_snapshot_restored", snapshot=snapshot)
        except subprocess.CalledProcessError as e:
            logger.error("emulator_snapshot_failed", error=e.stderr)
