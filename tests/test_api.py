import pytest
from fastapi.testclient import TestClient
from pathlib import Path
from backend.app.main import app
import zipfile

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def create_dummy_apk(path: Path):
    with zipfile.ZipFile(path, 'w') as zipf:
        zipf.writestr('AndroidManifest.xml', '<manifest></manifest>')

def test_analyze_valid_apk(tmp_path):
    model_dir = Path("models")
    if not model_dir.exists() or not (model_dir / "pipeline_static_binary.pkl").exists():
        pytest.skip("Models not available for e2e test")
        
    apk_path = tmp_path / "test.apk"
    create_dummy_apk(apk_path)
        
    with open(apk_path, "rb") as f:
        response = client.post("/analyze", files={"file": ("test.apk", f, "application/vnd.android.package-archive")})
    
    # We might get an androguard parsing error for dummy apk, but the status code isn't 500
    assert response.status_code in [200, 422]
    if response.status_code == 200:
        assert "verdict" in response.json()

def test_analyze_invalid_file_type(tmp_path):
    txt_path = tmp_path / "test.txt"
    txt_path.write_text("not an apk")
    
    with open(txt_path, "rb") as f:
        response = client.post("/analyze", files={"file": ("test.txt", f, "text/plain")})
        
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_APK"

def test_analyze_corrupted_apk(tmp_path):
    apk_path = tmp_path / "corrupted.apk"
    apk_path.write_bytes(b"random bytes")
    
    with open(apk_path, "rb") as f:
        response = client.post("/analyze", files={"file": ("corrupted.apk", f, "application/vnd.android.package-archive")})
        
    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_APK"
