import time
from backend.utils.exceptions import FridaError
from backend.utils.logger import logger

FRIDA_SCRIPT = """
Java.perform(function() {
    var hooks = {
        "API_DeviceInfo_android.telephony.TelephonyManager_getDeviceId": { cls: "android.telephony.TelephonyManager", method: "getDeviceId" },
        "API_DeviceData_android.os.SystemProperties_get": { cls: "android.os.SystemProperties", method: "get" },
        "API_DeviceData_android.content.ContentResolver_registerContentObserver": { cls: "android.content.ContentResolver", method: "registerContentObserver" },
        "API_Binder_android.app.ContextImpl_registerReceiver": { cls: "android.app.ContextImpl", method: "registerReceiver" },
        "API_Binder_android.app.Activity_startActivity": { cls: "android.app.Activity", method: "startActivity" },
        "API_IPC_android.content.ContextWrapper_startService": { cls: "android.content.ContextWrapper", method: "startService" },
        "API_IPC_android.telephony.SmsManager_sendTextMessage": { cls: "android.telephony.SmsManager", method: "sendTextMessage" },
        "API_Crypto_javax.crypto.Cipher_getInstance": { cls: "javax.crypto.Cipher", method: "getInstance" },
        "API_Network_java.net.URL_openConnection": { cls: "java.net.URL", method: "openConnection" }
    };

    var counts = {};
    Object.keys(hooks).forEach(function(key) {
        counts[key] = 0;
        try {
            var h = hooks[key];
            var cls = Java.use(h.cls);
            var orig = cls[h.method];
            if (orig) {
                orig.overload().implementation = function() {
                    counts[key]++;
                    send({type: "api_call", key: key, count: counts[key]});
                    return orig.apply(this, arguments);
                };
            }
        } catch(e) { }
    });
});
"""

class FridaRunner:
    def __init__(self):
        self.session = None
        self.script = None
        self.api_counts = {}

    def attach(self, package_name: str) -> None:
        try:
            import frida
            device = frida.get_usb_device(timeout=2)
            self.session = device.attach(package_name)
            self.script = self.session.create_script(FRIDA_SCRIPT)
            self.script.on("message", self._on_message)
            self.script.load()
            logger.info("frida_attached", package=package_name)
        except Exception as e:
            logger.error("frida_attach_failed", error=str(e))
            raise FridaError(f"Frida failed to attach: {str(e)}")

    def _on_message(self, message, data):
        if message["type"] == "send":
            payload = message["payload"]
            if payload["type"] == "api_call":
                self.api_counts[payload["key"]] = payload["count"]

    def get_api_counts(self) -> dict:
        return self.api_counts

    def detach(self) -> None:
        if self.session:
            try:
                self.session.detach()
            except:
                pass
            self.session = None
            self.script = None
