import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest, f_classif, mutual_info_classif
from sklearn.dummy import DummyClassifier
from sklearn.preprocessing import LabelEncoder
from pathlib import Path

def generate_mocks():
    models_dir = Path("c:/Users/yuvra/Desktop/andromal/models")
    models_dir.mkdir(parents=True, exist_ok=True)

    # 1. training_col_info.json
    all_feat_names = [f"feat_{i:04d}" for i in range(1, 9504)] # feat_0001 to feat_9503
    
    # Let's say indices 0-2262 are the nonzero var columns for simplicity
    nonzero_var_cols = all_feat_names[:2263]
    selected_cols = nonzero_var_cols[:80]
    
    col_info = {
        "all_feat_names": all_feat_names,
        "nonzero_var_cols": nonzero_var_cols,
        "selected_cols": selected_cols,
        "n_features_total": 9503,
        "n_features_nonzero": 2263
    }
    with open(models_dir / "training_col_info.json", "w") as f:
        json.dump(col_info, f, indent=4)

    # 2. var_mask_static.pkl
    # A pandas Series boolean mask of length 9503, where first 2263 are True
    var_mask = pd.Series([True]*2263 + [False]*(9503-2263), index=all_feat_names)
    joblib.dump(var_mask, models_dir / "var_mask_static.pkl")

    # 3. label_encoder_family.pkl
    families = ["Adware", "Backdoor", "Banker", "Dropper", "Fileinfector",
                "No Category", "Pua", "Ransomware", "Riskware", "Scareware",
                "Sms", "Spy", "Trojan"]
    le = LabelEncoder()
    le.fit(families)
    joblib.dump(le, models_dir / "label_encoder_family.pkl")

    # 4. pipeline_static_binary.pkl
    # Expects (N, 2263) input.
    # SelectKBest(k=80), StandardScaler, DummyClassifier
    # We will fit it on dummy target so it works
    X_static_dummy = np.random.rand(10, 2263)
    y_static_dummy = np.array([0]*5 + [1]*5)
    
    pipeline_static = Pipeline([
        ('selector', SelectKBest(f_classif, k=80)),
        ('scaler', StandardScaler()),
        ('classifier', DummyClassifier(strategy='prior')) # will output probabilities
    ])
    pipeline_static.fit(X_static_dummy, y_static_dummy)
    joblib.dump(pipeline_static, models_dir / "pipeline_static_binary.pkl")

    # 5. pipeline_dynamic_family.pkl
    # Expects (N, 130) input per the prompt
    X_dynamic_dummy = np.random.rand(26, 130)
    y_dynamic_dummy = np.array(list(range(13)) * 2) # 13 classes
    
    pipeline_dynamic = Pipeline([
        ('selector', SelectKBest(f_classif, k=80)), # prompt says mutual_info_classif but we keep it simple for dummy
        ('scaler', StandardScaler()),
        ('classifier', DummyClassifier(strategy='prior'))
    ])
    pipeline_dynamic.fit(X_dynamic_dummy, y_dynamic_dummy)
    joblib.dump(pipeline_dynamic, models_dir / "pipeline_dynamic_family.pkl")

    # 6. model_metadata.json
    metadata = {
        "version": "1.0",
        "static_binary": {"accuracy": 0.9623},
        "dynamic_family": {"accuracy": 0.8328}
    }
    with open(models_dir / "model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("Mock models generated successfully in models/")

if __name__ == "__main__":
    generate_mocks()
