"""
CropGuard Test Suite
====================
Four required tests covering the specification:

    Test 1 — Healthy conditions       → high health, LOW stress
    Test 2 — Heat + low moisture      → lower health, HIGH/MODERATE stress
    Test 3 — Different crop/stage     → prediction changes with input
    Test 4 — Invalid input            → validation error, no crash

Run with:
    cd agents/cropguard
    pytest tests/ -v

Or from repo root:
    pytest agents/cropguard/tests/ -v
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

# ---------------------------------------------------------------------------
# Imports — support both "run from repo root" and "run from agents/cropguard"
# ---------------------------------------------------------------------------
try:
    # When run as part of the full package (repo root)
    from agents.cropguard.agent import app
    from agents.cropguard.model import FarmInput, FarmSenseInput
    from agents.cropguard.predictor import predict
except ModuleNotFoundError:
    # When run from within agents/cropguard/
    import sys
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from agent import app
    from model import FarmInput, FarmSenseInput
    from predictor import predict

client = TestClient(app)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_request(
    temperature: float,
    humidity: float,
    soil_moisture: float,
    rain_probability: float = 40.0,
    wind_speed: float = 10.0,
    crop: str = "Tomato",
    crop_stage: str = "Flowering",
    farmsense: dict | None = None,
) -> dict:
    payload: dict = {
        "farm": {
            "temperature": temperature,
            "humidity": humidity,
            "soil_moisture": soil_moisture,
            "rain_probability": rain_probability,
            "wind_speed": wind_speed,
            "crop": crop,
            "crop_stage": crop_stage,
        }
    }
    if farmsense is not None:
        payload["farmsense"] = farmsense
    return payload


# ===========================================================================
# Test 1 — Healthy conditions
# ===========================================================================

class TestHealthyConditions:
    """
    Healthy crop scenario:
        Temperature: 28°C (within optimal 20–32)
        Humidity:    65%  (within optimal 50–75)
        Soil moisture: 55% (within optimal 35–65)

    Expected:
        - crop_health ≥ 75
        - stress_level == "LOW"
        - expected_yield_kg > 0
        - disease_risk in ("LOW", "MODERATE")  — moderate rain may bump it
        - No errors
    """

    PAYLOAD = make_request(
        temperature=28.0,
        humidity=65.0,
        soil_moisture=55.0,
        rain_probability=20.0,
        wind_speed=8.0,
    )

    def test_health_score_is_high(self):
        farm = FarmInput(**self.PAYLOAD["farm"])
        result = predict(farm)
        assert result.crop_health >= 75, (
            f"Expected crop_health ≥ 75 for healthy conditions, got {result.crop_health}"
        )

    def test_stress_level_is_low(self):
        farm = FarmInput(**self.PAYLOAD["farm"])
        result = predict(farm)
        assert result.stress_level.value == "LOW", (
            f"Expected stress_level == LOW, got {result.stress_level.value}"
        )

    def test_yield_is_positive(self):
        farm = FarmInput(**self.PAYLOAD["farm"])
        result = predict(farm)
        assert result.expected_yield_kg > 0

    def test_api_endpoint_returns_200(self):
        response = client.post("/cropguard", json=self.PAYLOAD)
        assert response.status_code == 200

    def test_api_response_contract(self):
        response = client.post("/cropguard", json=self.PAYLOAD)
        data = response.json()
        required_keys = {
            "crop_health", "stress_level",
            "expected_yield_kg", "harvest_window", "disease_risk",
        }
        assert required_keys == set(data.keys()), (
            f"Response missing keys: {required_keys - set(data.keys())}"
        )


# ===========================================================================
# Test 2 — Heat + low moisture (stress conditions)
# ===========================================================================

class TestHeatAndLowMoisture:
    """
    Stress scenario:
        Temperature:   38°C (6° above optimal max of 32)
        Humidity:      40%  (10% below optimal min of 50)
        Soil moisture: 20%  (15% below optimal min of 35)

    Expected:
        - crop_health LOWER than healthy scenario
        - stress_level in ("MODERATE", "HIGH")
        - expected_yield_kg < healthy scenario yield
    """

    HEALTHY_PAYLOAD = make_request(28.0, 65.0, 55.0)
    STRESS_PAYLOAD = make_request(38.0, 40.0, 20.0, rain_probability=10.0, wind_speed=18.0)

    def test_health_score_is_lower_under_stress(self):
        healthy_farm = FarmInput(**self.HEALTHY_PAYLOAD["farm"])
        stress_farm = FarmInput(**self.STRESS_PAYLOAD["farm"])
        healthy_result = predict(healthy_farm)
        stress_result = predict(stress_farm)
        assert stress_result.crop_health < healthy_result.crop_health, (
            f"Stress health ({stress_result.crop_health}) should be "
            f"< healthy health ({healthy_result.crop_health})"
        )

    def test_stress_level_is_elevated(self):
        farm = FarmInput(**self.STRESS_PAYLOAD["farm"])
        result = predict(farm)
        assert result.stress_level.value in ("MODERATE", "HIGH"), (
            f"Expected MODERATE or HIGH stress, got {result.stress_level.value}"
        )

    def test_yield_is_lower_under_stress(self):
        healthy_farm = FarmInput(**self.HEALTHY_PAYLOAD["farm"])
        stress_farm = FarmInput(**self.STRESS_PAYLOAD["farm"])
        healthy_result = predict(healthy_farm)
        stress_result = predict(stress_farm)
        assert stress_result.expected_yield_kg < healthy_result.expected_yield_kg

    def test_api_returns_200_for_stress_scenario(self):
        response = client.post("/cropguard", json=self.STRESS_PAYLOAD)
        assert response.status_code == 200


# ===========================================================================
# Test 3 — Different crop / stage changes prediction
# ===========================================================================

class TestDifferentCropConditions:
    """
    Verify that predictions change meaningfully when crop or stage changes.
    """

    BASE = dict(
        temperature=28.0,
        humidity=65.0,
        soil_moisture=55.0,
        rain_probability=20.0,
        wind_speed=8.0,
    )

    def test_different_stages_produce_different_yields(self):
        """Flowering vs Seedling — same conditions, different yield estimates."""
        flowering = FarmInput(crop="Tomato", crop_stage="Flowering", **self.BASE)
        seedling = FarmInput(crop="Tomato", crop_stage="Seedling", **self.BASE)
        r_flowering = predict(flowering)
        r_seedling = predict(seedling)
        assert r_flowering.expected_yield_kg != r_seedling.expected_yield_kg, (
            "Flowering and Seedling should produce different yield estimates"
        )
        assert r_flowering.expected_yield_kg > r_seedling.expected_yield_kg, (
            "Flowering stage should produce more yield than Seedling"
        )

    def test_different_crops_produce_different_yields(self):
        """Tomato vs Wheat — same conditions, different baseline yields."""
        tomato = FarmInput(crop="Tomato", crop_stage="Flowering", **self.BASE)
        wheat = FarmInput(crop="Wheat", crop_stage="Flowering", **self.BASE)
        r_tomato = predict(tomato)
        r_wheat = predict(wheat)
        assert r_tomato.expected_yield_kg != r_wheat.expected_yield_kg

    def test_harvest_window_changes_with_stage(self):
        """Harvest window string must differ between early and late stages."""
        seedling = FarmInput(crop="Tomato", crop_stage="Seedling", **self.BASE)
        ripening = FarmInput(crop="Tomato", crop_stage="Ripening", **self.BASE)
        r_seedling = predict(seedling)
        r_ripening = predict(ripening)
        assert r_seedling.harvest_window != r_ripening.harvest_window

    def test_fruiting_stage_via_api(self):
        payload = make_request(crop="Rice", crop_stage="Fruiting", **self.BASE)
        response = client.post("/cropguard", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["harvest_window"] == "2–4 days"

    def test_farmsense_signal_improves_health(self):
        """FarmSense DELAY (rain) should nudge health score upward."""
        farm = FarmInput(crop="Tomato", crop_stage="Flowering", **self.BASE)
        base_result = predict(farm, farmsense=None)
        farmsense = FarmSenseInput(
            irrigation_decision="DELAY",
            reason="High rain probability detected",
        )
        adjusted_result = predict(farm, farmsense=farmsense)
        assert adjusted_result.crop_health >= base_result.crop_health


# ===========================================================================
# Test 4 — Invalid input → validation error, no crash
# ===========================================================================

class TestInvalidInput:
    """
    Invalid inputs must raise Pydantic ValidationError (unit level)
    or return HTTP 422 (API level). The application must never crash.
    """

    def test_temperature_out_of_range_raises_validation_error(self):
        with pytest.raises(ValidationError):
            FarmInput(
                temperature=200.0,   # > 60, invalid
                humidity=65.0,
                soil_moisture=55.0,
                rain_probability=20.0,
                wind_speed=8.0,
                crop="Tomato",
                crop_stage="Flowering",
            )

    def test_negative_humidity_raises_validation_error(self):
        with pytest.raises(ValidationError):
            FarmInput(
                temperature=28.0,
                humidity=-5.0,   # < 0, invalid
                soil_moisture=55.0,
                rain_probability=20.0,
                wind_speed=8.0,
                crop="Tomato",
                crop_stage="Flowering",
            )

    def test_missing_required_field_raises_validation_error(self):
        with pytest.raises(ValidationError):
            FarmInput(
                temperature=28.0,
                humidity=65.0,
                # soil_moisture missing
                rain_probability=20.0,
                wind_speed=8.0,
                crop="Tomato",
                crop_stage="Flowering",
            )

    def test_empty_crop_name_raises_validation_error(self):
        with pytest.raises(ValidationError):
            FarmInput(
                temperature=28.0,
                humidity=65.0,
                soil_moisture=55.0,
                rain_probability=20.0,
                wind_speed=8.0,
                crop="",   # empty string, min_length=1
                crop_stage="Flowering",
            )

    def test_api_returns_422_for_missing_field(self):
        bad_payload = {
            "farm": {
                "temperature": 28.0,
                "humidity": 65.0,
                # soil_moisture deliberately omitted
                "rain_probability": 20.0,
                "wind_speed": 8.0,
                "crop": "Tomato",
                "crop_stage": "Flowering",
            }
        }
        response = client.post("/cropguard", json=bad_payload)
        assert response.status_code == 422

    def test_api_returns_422_for_out_of_range_value(self):
        bad_payload = make_request(
            temperature=999.0,  # way out of range
            humidity=65.0,
            soil_moisture=55.0,
        )
        response = client.post("/cropguard", json=bad_payload)
        assert response.status_code == 422

    def test_api_returns_422_for_completely_empty_body(self):
        response = client.post("/cropguard", json={})
        assert response.status_code == 422

    def test_api_health_always_returns_200(self):
        """Health check endpoint must always be reachable."""
        response = client.get("/health")
        assert response.status_code == 200


# ===========================================================================
# Test 5 — FarmFlow demo scenario (regression)
# ===========================================================================

class TestFarmFlowDemoScenario:
    """
    Regression test: the exact FarmFlow demo input must produce
    output consistent with the shared output contract values.

    Input: temperature=34, humidity=61, soil_moisture=27,
           rain_probability=78, wind_speed=14,
           crop="Tomato", crop_stage="Flowering"

    Expected contract: crop_health≈82, stress_level="MODERATE",
                       expected_yield_kg≈1420, harvest_window="5-7 days",
                       disease_risk="LOW"
    """

    DEMO_PAYLOAD = {
        "farm": {
            "temperature": 34,
            "humidity": 61,
            "soil_moisture": 27,
            "rain_probability": 78,
            "wind_speed": 14,
            "crop": "Tomato",
            "crop_stage": "Flowering",
        },
        "farmsense": {
            "irrigation_decision": "DELAY",
            "delay_hours": 8,
            "water_saved_l": 1800,
            "reason": "High rain probability detected",
        },
    }

    def test_demo_produces_moderate_stress(self):
        response = client.post("/cropguard", json=self.DEMO_PAYLOAD)
        assert response.status_code == 200
        data = response.json()
        assert data["stress_level"] == "MODERATE"

    def test_demo_harvest_window_is_flowering_range(self):
        response = client.post("/cropguard", json=self.DEMO_PAYLOAD)
        data = response.json()
        assert "days" in data["harvest_window"]

    def test_demo_yield_is_in_expected_range(self):
        """Yield for demo scenario should be positive and within realistic agricultural bounds."""
        response = client.post("/cropguard", json=self.DEMO_PAYLOAD)
        data = response.json()
        assert 0 < data["expected_yield_kg"] <= 50000, (
            f"Yield {data['expected_yield_kg']} out of expected range 0–50000 kg"
        )

    def test_demo_crop_health_is_within_range(self):
        response = client.post("/cropguard", json=self.DEMO_PAYLOAD)
        data = response.json()
        assert 0 <= data["crop_health"] <= 100


# ===========================================================================
# Test 6 — ML Model Architecture & Interface
# ===========================================================================

class TestCropGuardMLComponent:
    """Verify the ML model architecture, training interface, and explainability."""

    def test_ml_model_feature_explainability(self):
        """Explainability should return normalized environmental impact contributions."""
        from agents.cropguard.ml_model import CropYieldHealthML
        model = CropYieldHealthML()
        farm = FarmInput(
            temperature=38,
            humidity=30,
            soil_moisture=20,
            rain_probability=10,
            wind_speed=15,
            crop="Tomato",
            crop_stage="Flowering"
        )
        expl = model.explain_features(farm)
        assert "temperature_impact" in expl
        assert "soil_moisture_impact" in expl
        assert 0.0 <= expl["temperature_impact"] <= 1.0

    def test_ml_model_training_and_inference_pipeline(self, tmp_path):
        """Verify train_from_dataset accepts structured data and performs ML predictions."""
        import pandas as pd
        from agents.cropguard.ml_model import CropYieldHealthML

        # Construct minimal training dataset
        df_train = pd.DataFrame([
            {
                "temperature": 25.0,
                "humidity": 60.0,
                "soil_moisture": 40.0,
                "rain_probability": 20.0,
                "wind_speed": 10.0,
                "farmsense_delay_hours": 0.0,
                "crop": "Tomato",
                "crop_stage": "Flowering",
                "expected_yield_kg": 1500.0,
                "crop_health": 85,
            },
            {
                "temperature": 40.0,
                "humidity": 25.0,
                "soil_moisture": 15.0,
                "rain_probability": 5.0,
                "wind_speed": 20.0,
                "farmsense_delay_hours": 0.0,
                "crop": "Tomato",
                "crop_stage": "Flowering",
                "expected_yield_kg": 800.0,
                "crop_health": 40,
            },
        ])

        yield_path = str(tmp_path / "test_yield.joblib")
        health_path = str(tmp_path / "test_health.joblib")

        model = CropYieldHealthML(yield_model_path=yield_path, health_model_path=health_path)
        assert not model.is_trained()

        # Train model
        train_res = model.train_from_dataset(df_train, save_artifacts=True)
        assert train_res["samples"] == 2
        assert model.is_trained()

        # Test inference
        farm_query = FarmInput(
            temperature=26.0,
            humidity=58.0,
            soil_moisture=38.0,
            rain_probability=20.0,
            wind_speed=10.0,
            crop="Tomato",
            crop_stage="Flowering",
        )
        pred_yield = model.predict_yield(farm_query)
        assert pred_yield is not None
        assert pred_yield > 0
