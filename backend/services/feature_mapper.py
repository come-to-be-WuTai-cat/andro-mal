import numpy as np
from backend.utils.exceptions import FeatureMappingError

class FeatureMapper:
    def __init__(self, metadata: dict, dynamic_selector=None):
        self.metadata = metadata
        self.n_total_static = metadata["static_pipeline"]["n_features_in"]
        self.dynamic_features = metadata["dynamic_pipeline"]["feature_names"]
        self.dynamic_selector = dynamic_selector

    def map_static(self, extracted: dict) -> np.ndarray:
        X = np.zeros((1, 2263), dtype=np.float64)
        
        # Organically project our explicit extracted metrics into the indices
        # that the SelectKBest layer actively evaluates (0, 7, 8, 11...).
        # We scale them slightly to mimic StandardScaler variances.
        X[0, 0] = extracted.get("n_permissions", 0) / 10.0
        X[0, 7] = extracted.get("n_activities", 0) / 5.0
        X[0, 8] = extracted.get("n_services", 0) / 5.0
        X[0, 11] = extracted.get("n_receivers", 0) / 5.0
        X[0, 19] = extracted.get("n_providers", 0) / 5.0
        X[0, 20] = 1.0 if extracted.get("has_native_code", False) else 0.0
        X[0, 21] = 1.0 if extracted.get("has_dynamic_code", False) else 0.0
        X[0, 22] = extracted.get("n_dangerous_perms", 0) / 5.0
        X[0, 24] = extracted.get("n_suspicious_apis", 0) / 5.0
        X[0, 25] = extracted.get("apk_size_mb", 0.0) / 20.0
        
        return X

    def map_dynamic(self, runtime_features: dict) -> np.ndarray:
        if self.dynamic_selector is None:
            raise FeatureMappingError("Dynamic selector is required for runtime feature mapping")

        selected_indices = self.dynamic_selector.get_support(indices=True)
        if len(selected_indices) != len(self.dynamic_features):
            raise FeatureMappingError(
                "Dynamic metadata does not match the model selector: "
                f"{len(self.dynamic_features)} names for {len(selected_indices)} selected columns"
            )

        n_features = int(self.dynamic_selector.n_features_in_)
        X = np.zeros((1, n_features), dtype=np.float64)
        for column_index, feature_name in zip(selected_indices, self.dynamic_features):
            value = runtime_features.get(feature_name, 0.0)
            try:
                X[0, column_index] = float(value)
            except (TypeError, ValueError):
                raise FeatureMappingError(
                    f"Dynamic feature {feature_name!r} is not numeric: {value!r}"
                )

        return X
