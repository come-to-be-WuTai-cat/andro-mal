import numpy as np

class DynamicFeatureBuilder:
    def get_meminfo(self, package_name: str) -> dict:
        import subprocess
        try:
            result = subprocess.run(["adb", "shell", "dumpsys", "meminfo", package_name], capture_output=True, text=True)
            out = result.stdout
            
            meminfo = {}
            for line in out.splitlines():
                if "TOTAL PSS:" in line:
                    parts = line.split()
                    try:
                        meminfo["Memory_PssTotal"] = float(parts[2])
                    except:
                        pass
            return meminfo
        except Exception:
            return {}

    def get_process_count(self) -> int:
        import subprocess
        try:
            result = subprocess.run(["adb", "shell", "ps"], capture_output=True, text=True)
            return len(result.stdout.strip().splitlines()) - 1
        except Exception:
            return 0

    def build(self, meminfo: dict, api_counts: dict, logcat_counts: dict, process_count: int) -> dict:
        expected_keys = [
            "Memory_PssTotal", "Memory_PssClean", "Memory_SharedDirty",
            "Memory_PrivateDirty", "Memory_SharedClean", "Memory_PrivateClean",
            "Memory_HeapSize", "Memory_HeapAlloc", "Memory_HeapFree",
            "Memory_Views", "Memory_ViewRootImpl", "Memory_AppContexts",
            "Memory_Activities", "Memory_Assets", "Memory_AssetManagers",
            "Memory_LocalBinders", "Memory_ProxyBinders", "Memory_ParcelMemory",
            "Memory_ParcelCount", "Memory_DeathRecipients", "Memory_OpenSSLSockets",
            "Logcat_total", "Logcat_verbose", "Logcat_debug", "Logcat_info",
            "Logcat_warning", "Logcat_error", "Logcat_fatal", "Logcat_silent",
            "Process_total",
            "API_DeviceData_android.os.SystemProperties_get",
            "API_Binder_android.app.ContextImpl_registerReceiver",
            "API_DeviceData_android.content.ContentResolver_registerContentObserver",
            "API_IPC_android.content.ContextWrapper_startService",
            "API_DeviceInfo_android.telephony.TelephonyManager_getDeviceId",
            "API_Binder_android.app.Activity_startActivity"
        ]
        
        feature_dict = {}
        for key in expected_keys:
            if key in logcat_counts:
                feature_dict[key] = logcat_counts[key]
            elif key in api_counts:
                feature_dict[key] = api_counts[key]
            elif key in meminfo:
                feature_dict[key] = meminfo[key]
            elif key == "Process_total":
                feature_dict[key] = process_count
            else:
                feature_dict[key] = 0.0

        return feature_dict
