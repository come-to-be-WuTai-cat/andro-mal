import pytest
import numpy as np
from pathlib import Path
from backend.services.model_service import ModelService
from backend.utils.exceptions import ModelPredictionError

def test_models_load_successfully():
    service = ModelService()
    model_dir = Path("models")
    if model_dir.exists() and (model_dir / "pipeline_static_binary.pkl").exists():
        service.load(model_dir)
        assert service._loaded == True
    else:
        pytest.skip("Models not available for testing")

def test_predict_static_benign():
    service = ModelService()
    model_dir = Path("models")
    if not model_dir.exists() or not (model_dir / "pipeline_static_binary.pkl").exists():
        pytest.skip("Models not available")
    
    service.load(model_dir)
    X = np.zeros((1, service.pipeline_static.steps[0][1].n_features_in_))
    result = service.predict_static(X)
    assert "verdict" in result
    assert result["verdict"] in ["Malware", "Benign"]

def test_predict_static_returns_probabilities():
    service = ModelService()
    model_dir = Path("models")
    if not model_dir.exists() or not (model_dir / "pipeline_static_binary.pkl").exists():
        pytest.skip("Models not available")
        
    service.load(model_dir)
    X = np.zeros((1, service.pipeline_static.steps[0][1].n_features_in_))
    result = service.predict_static(X)
    assert result["malware_prob"] + result["benign_prob"] == pytest.approx(1.0)

def test_predict_static_wrong_shape_raises():
    service = ModelService()
    model_dir = Path("models")
    if not model_dir.exists() or not (model_dir / "pipeline_static_binary.pkl").exists():
        pytest.skip("Models not available")
        
    service.load(model_dir)
    X = np.zeros((1, 100)) # Wrong shape
    with pytest.raises(ModelPredictionError):
        service.predict_static(X)
