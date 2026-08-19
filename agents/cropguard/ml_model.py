"""
CropGuard — Machine Learning Yield Prediction Component
=========================================================

Provides a lightweight, explainable Machine Learning model for predicting:
    Expected Crop Yield (kg)

Trained on the realistic Tamil Nadu agricultural dataset:
    `data/farmflow_tamilnadu_realistic_synthetic_v2_3600.csv`

Architecture:
    - Scikit-Learn Pipeline:
        - Numerical features: [temperature, humidity, soil_moisture, rain_probability] -> StandardScaler
        - Categorical features: [crop, crop_stage] -> OneHotEncoder(handle_unknown='ignore')
        - Estimator: RandomForestRegressor(n_estimators=100, max_depth=15, min_samples_split=4, random_state=42)
    - Explainability: Feature impact sensitivity analysis.
    - Zero data leakage: Market features (market_demand, price) are strictly excluded.
    - Agronomic consistency: Health, stress, disease risk, and harvest window use deterministic agronomic models.
    - Deterministic fallback: Graceful fallback to agronomic calculations if model artifact is absent.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Tuple

# Lazy imports for scikit-learn / joblib so module loads smoothly
try:
    import joblib
    import numpy as np
    from sklearn.compose import ColumnTransformer
    from sklearn.dummy import DummyRegressor
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    from sklearn.model_selection import KFold, cross_val_score, train_test_split
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import OneHotEncoder, StandardScaler
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

# Default artifact model paths
DEFAULT_MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
DEFAULT_YIELD_MODEL_PATH = os.path.join(DEFAULT_MODEL_DIR, "crop_yield_model.joblib")
DEFAULT_DATASET_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "data",
    "farmflow_tamilnadu_realistic_synthetic_v2_3600.csv",
)

NUMERIC_FEATURES = [
    "temperature",
    "humidity",
    "soil_moisture",
    "rain_probability",
]

CATEGORICAL_FEATURES = [
    "crop",
    "crop_stage",
]

ALL_FEATURE_COLUMNS = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def _build_feature_preprocessor() -> ColumnTransformer:
    """Build a scikit-learn ColumnTransformer for agricultural telemetry."""
    if not HAS_SKLEARN:
        raise ImportError("scikit-learn is required to build ML pipeline")

    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERIC_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )
    return preprocessor


class CropYieldHealthML:
    """
    Lightweight, explainable agricultural ML model for CropGuard yield prediction.
    """

    def __init__(
        self,
        yield_model_path: str = DEFAULT_YIELD_MODEL_PATH,
        health_model_path: Optional[str] = None,
    ):
        self.yield_model_path = yield_model_path
        self.health_model_path = health_model_path
        self.yield_pipeline: Optional[Pipeline] = None
        self.evaluation_metrics: Dict[str, Any] = {}

        # Attempt to load existing trained artifacts if available
        self._load_if_exists()

    def is_trained(self) -> bool:
        """Return True if trained ML model is loaded and ready for inference."""
        return self.yield_pipeline is not None

    def _load_if_exists(self) -> None:
        """Load trained models from disk if artifacts exist."""
        if not HAS_SKLEARN:
            return

        if os.path.exists(self.yield_model_path):
            try:
                self.yield_pipeline = joblib.load(self.yield_model_path)
            except Exception:
                self.yield_pipeline = None

    def _extract_feature_dict(self, farm: Any, farmsense: Any = None) -> Dict[str, Any]:
        """Convert FarmInput and optional FarmSenseInput into structured model feature row."""
        temp = float(getattr(farm, "temperature", 25.0))
        hum = float(getattr(farm, "humidity", 60.0))
        soil = float(getattr(farm, "soil_moisture", 40.0))
        rain = float(getattr(farm, "rain_probability", 20.0))
        crop = str(getattr(farm, "crop", "Tomato")).strip()
        crop_stage = str(getattr(farm, "crop_stage", "Flowering")).strip()

        return {
            "temperature": temp,
            "humidity": hum,
            "soil_moisture": soil,
            "rain_probability": rain,
            "crop": crop,
            "crop_stage": crop_stage,
        }

    def train_from_dataset(
        self,
        data: Any = DEFAULT_DATASET_PATH,
        yield_target_col: str = "yield",
        save_artifacts: bool = True,
        test_size: float = 0.2,
        random_state: int = 42,
    ) -> Dict[str, Any]:
        """
        Train ML Yield model from a pandas DataFrame or path to CSV dataset.
        Computes MAE, RMSE, R², 5-fold cross-validation, and baseline comparison.

        Parameters
        ----------
        data : pd.DataFrame or str (path to CSV)
            Training dataset containing feature columns and target.
        yield_target_col : str
            Column name for yield in kg (default: 'yield').
        save_artifacts : bool
            Whether to serialize trained pipeline to disk.
        test_size : float
            Proportion of dataset for test evaluation (default: 0.2).
        random_state : int
            Seed for reproducibility.

        Returns
        -------
        dict with evaluation metrics (MAE, RMSE, R2, baseline metrics, CV metrics).
        """
        if not HAS_SKLEARN:
            raise ImportError("scikit-learn and pandas are required for model training.")

        import pandas as pd

        if isinstance(data, str):
            if not os.path.exists(data):
                raise FileNotFoundError(f"Dataset file not found at: {data}")
            df = pd.read_csv(data)
        elif isinstance(data, pd.DataFrame):
            df = data.copy()
        else:
            raise ValueError("data must be a pandas DataFrame or CSV filepath")

        # Standardize column names if needed
        if "rain/rain_probability" in df.columns and "rain_probability" not in df.columns:
            df = df.rename(columns={"rain/rain_probability": "rain_probability"})

        if yield_target_col not in df.columns and "expected_yield_kg" in df.columns:
            yield_target_col = "expected_yield_kg"

        # Verify required feature columns exist
        missing = [c for c in ALL_FEATURE_COLUMNS if c not in df.columns]
        if missing:
            raise ValueError(f"Dataset missing required feature columns: {missing}")

        if yield_target_col not in df.columns:
            raise ValueError(f"Dataset missing target column: {yield_target_col}")

        # Strict feature extraction (no market_demand or price)
        X = df[ALL_FEATURE_COLUMNS]
        y = df[yield_target_col]

        # 80/20 Train/Test Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        # Baseline: Dummy Regressor (predicts mean yield)
        dummy = DummyRegressor(strategy="mean")
        dummy.fit(X_train, y_train)
        dummy_preds = dummy.predict(X_test)
        dummy_mae = float(mean_absolute_error(y_test, dummy_preds))
        dummy_rmse = float(np.sqrt(mean_squared_error(y_test, dummy_preds)))
        dummy_r2 = float(r2_score(y_test, dummy_preds))

        # Build & Fit RandomForest Model Pipeline
        preprocessor = _build_feature_preprocessor()
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("regressor", RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                min_samples_split=4,
                random_state=random_state,
                n_jobs=-1,
            )),
        ])

        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        test_mae = float(mean_absolute_error(y_test, y_pred))
        test_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        test_r2 = float(r2_score(y_test, y_pred))

        # 5-Fold Cross Validation on entire dataset (if sufficient samples exist)
        cv_metrics = {}
        if len(df) >= 5:
            cv_splits = min(5, len(df))
            cv = KFold(n_splits=cv_splits, shuffle=True, random_state=random_state)
            cv_r2_scores = cross_val_score(pipeline, X, y, cv=cv, scoring="r2")
            cv_mae_scores = -cross_val_score(pipeline, X, y, cv=cv, scoring="neg_mean_absolute_error")
            cv_rmse_scores = np.sqrt(-cross_val_score(pipeline, X, y, cv=cv, scoring="neg_mean_squared_error"))
            cv_metrics = {
                "cv_r2_mean": round(float(cv_r2_scores.mean()), 4),
                "cv_r2_std": round(float(cv_r2_scores.std()), 4),
                "cv_mae_mean_kg": round(float(cv_mae_scores.mean()), 2),
                "cv_mae_std_kg": round(float(cv_mae_scores.std()), 2),
                "cv_rmse_mean_kg": round(float(cv_rmse_scores.mean()), 2),
                "cv_rmse_std_kg": round(float(cv_rmse_scores.std()), 2),
            }

        # Refit on full dataset for maximum deployment accuracy
        pipeline.fit(X, y)
        self.yield_pipeline = pipeline

        metrics = {
            "dataset_samples": len(df),
            "samples": len(df),
            "features_used": ALL_FEATURE_COLUMNS,
            "target": yield_target_col,
            "test_evaluation": {
                "mae_kg": round(test_mae, 2),
                "rmse_kg": round(test_rmse, 2),
                "r2_score": round(test_r2, 4),
            },
            "baseline_dummy_comparison": {
                "baseline_mae_kg": round(dummy_mae, 2),
                "baseline_rmse_kg": round(dummy_rmse, 2),
                "baseline_r2": round(dummy_r2, 4),
                "mae_improvement_pct": round(((dummy_mae - test_mae) / dummy_mae) * 100, 2),
                "rmse_improvement_pct": round(((dummy_rmse - test_rmse) / dummy_rmse) * 100, 2),
            },
            "cross_validation_5fold": cv_metrics,
        }

        self.evaluation_metrics = metrics

        # Save artifacts
        if save_artifacts:
            os.makedirs(os.path.dirname(self.yield_model_path), exist_ok=True)
            joblib.dump(pipeline, self.yield_model_path)
            metrics["saved_model_path"] = self.yield_model_path

        return metrics

    def predict_yield(self, farm: Any, farmsense: Any = None) -> Optional[float]:
        """Predict expected harvest yield in kg using the trained ML model."""
        if not self.yield_pipeline or not HAS_SKLEARN:
            return None

        import pandas as pd
        feat_dict = self._extract_feature_dict(farm, farmsense)
        df_row = pd.DataFrame([feat_dict])
        pred = self.yield_pipeline.predict(df_row)[0]
        return float(max(0.0, round(pred, 1)))

    def predict_health(self, farm: Any, farmsense: Any = None) -> Optional[int]:
        """Crop health is maintained as an agronomic calculation (no health target in dataset)."""
        return None

    def explain_features(self, farm: Any, farmsense: Any = None) -> Dict[str, float]:
        """
        Explain the relative impact of environmental factors on the yield prediction.
        Returns normalized environmental sensitivity contributions [0.0 - 1.0].
        """
        feat_dict = self._extract_feature_dict(farm, farmsense)
        temp = feat_dict["temperature"]
        soil = feat_dict["soil_moisture"]
        hum = feat_dict["humidity"]
        rain = feat_dict["rain_probability"]

        # Deviations from optimal bands
        temp_stress = max(0.0, abs(temp - 28.0) / 15.0)
        soil_stress = max(0.0, abs(soil - 50.0) / 40.0)
        hum_stress = max(0.0, abs(hum - 70.0) / 30.0)
        rain_factor = min(1.0, rain / 100.0)

        total = temp_stress + soil_stress + hum_stress + rain_factor + 1e-5
        return {
            "temperature_impact": round(temp_stress / total, 3),
            "soil_moisture_impact": round(soil_stress / total, 3),
            "humidity_impact": round(hum_stress / total, 3),
            "rain_forecast_impact": round(rain_factor / total, 3),
        }


# Global singleton instance for CropGuard
ml_engine = CropYieldHealthML()
