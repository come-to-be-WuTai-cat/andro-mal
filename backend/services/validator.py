import zipfile
from pathlib import Path
import numpy as np
from backend.app.config import MAX_APK_SIZE_MB
from backend.utils.exceptions import APKValidationError, FeatureMappingError

def validate_apk_file(file_path: Path) -> None:
    if file_path.suffix.lower() != '.apk':
        raise APKValidationError("File extension must be .apk")
    
    if not file_path.exists():
        raise APKValidationError("File not found")
        
    size_mb = file_path.stat().st_size / (1024 * 1024)
    if size_mb > MAX_APK_SIZE_MB:
        raise APKValidationError(f"File size {size_mb:.2f}MB exceeds {MAX_APK_SIZE_MB}MB limit")
        
    if not zipfile.is_zipfile(file_path):
        raise APKValidationError("File is not a valid ZIP archive")
        
    try:
        with zipfile.ZipFile(file_path, 'r') as zf:
            if 'AndroidManifest.xml' not in zf.namelist():
                raise APKValidationError("File does not contain AndroidManifest.xml. Not a valid APK.")
    except Exception as e:
        raise APKValidationError(f"Failed to read APK contents: {str(e)}")

def validate_feature_array(X: np.ndarray, expected_shape: tuple) -> None:
    if X.shape != expected_shape:
        raise FeatureMappingError(f"Shape mismatch: expected {expected_shape}, got {X.shape}")
        
    if np.isnan(X).any():
        raise FeatureMappingError("Array contains NaN values")
        
    if np.isinf(X).any():
        raise FeatureMappingError("Array contains Inf values")
        
    if X.dtype != np.float64:
        raise FeatureMappingError(f"Expected float64 dtype, got {X.dtype}")
