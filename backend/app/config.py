from pathlib import Path

MODEL_DIR = Path("models/")
MAX_APK_SIZE_MB = 100
MALWARE_THRESHOLD = 0.5
FAMILY_CONF_MIN = 0.5
N_STATIC_FEATURES = 9503
N_STATIC_NONZERO = 2263
N_STATIC_SELECTED = 80
N_DYNAMIC_FEATURES = 125
N_DYNAMIC_SELECTED = 80
FAMILY_NAMES = [
    "Adware", "Backdoor", "Banker", "Dropper", "Fileinfector",
    "No Category", "Pua", "Ransomware", "Riskware", "Scareware",
    "Sms", "Spy", "Trojan"
]
ZERO_DAY_LABEL = "Unknown / Novel Threat (possible Zero Day)"
