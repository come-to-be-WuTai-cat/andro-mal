import numpy as np
import pytest

from backend.services.feature_mapper import FeatureMapper
from backend.utils.exceptions import FeatureMappingError


class DummySelector:
    n_features_in_ = 5

    def get_support(self, indices=False):
        support = np.array([True, False, True, False, True])
        return np.flatnonzero(support) if indices else support


@pytest.fixture
def metadata():
    return {
        "static_pipeline": {"n_features_in": 9503},
        "dynamic_pipeline": {
            "feature_names": ["Memory_PssTotal", "API_Test", "Network_Test"]
        },
    }


def test_map_static_shape_and_values(metadata):
    mapper = FeatureMapper(metadata)
    X = mapper.map_static({"n_permissions": 5, "apk_size_mb": 2.5})
    assert X.shape == (1, 2263)
    assert X.dtype == np.float64
    assert X[0, 0] == pytest.approx(0.5)
    assert X[0, 25] == pytest.approx(0.125)
    assert np.isfinite(X).all()


def test_map_static_empty_dict(metadata):
    X = FeatureMapper(metadata).map_static({})
    assert X.shape == (1, 2263)
    assert np.all(X == 0)


def test_map_dynamic_aligns_names_to_selected_columns(metadata):
    mapper = FeatureMapper(metadata, dynamic_selector=DummySelector())
    X = mapper.map_dynamic(
        {"Memory_PssTotal": 10, "API_Test": 2, "Network_Test": 7}
    )
    assert X.shape == (1, 5)
    assert X.tolist() == [[10.0, 0.0, 2.0, 0.0, 7.0]]


def test_map_dynamic_requires_selector(metadata):
    with pytest.raises(FeatureMappingError):
        FeatureMapper(metadata).map_dynamic({})


def test_map_dynamic_rejects_non_numeric_values(metadata):
    mapper = FeatureMapper(metadata, dynamic_selector=DummySelector())
    with pytest.raises(FeatureMappingError):
        mapper.map_dynamic({"Memory_PssTotal": "not-a-number"})
