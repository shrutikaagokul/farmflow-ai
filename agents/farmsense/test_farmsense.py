"""
FarmSense — Test Suite
========================

Tests covering all three decision paths, input validation,
and water savings calculations.
"""

import pytest
from pydantic import ValidationError

from agents.farmsense.agent import analyze
from agents.farmsense.config import (
    DECISION_IRRIGATE,
    DECISION_DELAY,
    DECISION_NO_ACTION,
)


# ------------------------------------------------------------------
# Helper: base telemetry that can be overridden per test
# ------------------------------------------------------------------
def _telemetry(**overrides) -> dict:
    """Return a valid telemetry dict with optional field overrides."""
    base = {
        "temperature": 30,
        "humidity": 60,
        "soil_moisture": 40,
        "rain_probability": 30,
        "wind_speed": 10,
        "crop": "Tomato",
        "crop_stage": "Flowering",
    }
    base.update(overrides)
    return base


# ==================================================================
# SCENARIO 1: Low soil moisture + high rain probability → DELAY
# ==================================================================
class TestDelayDecision:
    """FarmSense should recommend DELAY when soil is dry but rain is coming."""

    def test_delay_basic(self):
        """Low soil (27%) + high rain (78%) → DELAY."""
        result = analyze(_telemetry(soil_moisture=27, rain_probability=78))
        assert result.irrigation_decision == DECISION_DELAY

    def test_delay_has_positive_delay_hours(self):
        """DELAY decisions must recommend waiting some hours."""
        result = analyze(_telemetry(soil_moisture=27, rain_probability=78))
        assert result.delay_hours > 0

    def test_delay_saves_water(self):
        """DELAY decisions must report water saved."""
        result = analyze(_telemetry(soil_moisture=27, rain_probability=78))
        assert result.water_saved_l > 0

    def test_delay_reason_mentions_rain(self):
        """The reason should explain why we're delaying."""
        result = analyze(_telemetry(soil_moisture=27, rain_probability=78))
        assert "rain" in result.reason.lower()

    def test_delay_at_threshold_boundary(self):
        """Soil exactly at threshold (35%) is NOT low → NO_ACTION, not DELAY."""
        result = analyze(_telemetry(soil_moisture=35, rain_probability=78))
        assert result.irrigation_decision == DECISION_NO_ACTION

    def test_delay_rain_at_threshold(self):
        """Rain exactly at threshold (50%) is considered high → DELAY."""
        result = analyze(_telemetry(soil_moisture=20, rain_probability=50))
        assert result.irrigation_decision == DECISION_DELAY


# ==================================================================
# SCENARIO 2: Low soil moisture + low rain probability → IRRIGATE
# ==================================================================
class TestIrrigateDecision:
    """FarmSense should recommend IRRIGATE when soil is dry and no rain is expected."""

    def test_irrigate_basic(self):
        """Low soil (20%) + low rain (10%) → IRRIGATE."""
        result = analyze(_telemetry(soil_moisture=20, rain_probability=10))
        assert result.irrigation_decision == DECISION_IRRIGATE

    def test_irrigate_zero_delay(self):
        """IRRIGATE should have 0 delay hours."""
        result = analyze(_telemetry(soil_moisture=20, rain_probability=10))
        assert result.delay_hours == 0

    def test_irrigate_no_water_saved(self):
        """IRRIGATE uses water — water_saved_l should be 0."""
        result = analyze(_telemetry(soil_moisture=20, rain_probability=10))
        assert result.water_saved_l == 0

    def test_irrigate_reason_mentions_low_moisture(self):
        """The reason should mention low soil moisture."""
        result = analyze(_telemetry(soil_moisture=20, rain_probability=10))
        assert "low" in result.reason.lower() or "moisture" in result.reason.lower()

    def test_irrigate_with_heat_stress(self):
        """High temperature should still recommend IRRIGATE and mention urgency."""
        result = analyze(_telemetry(
            soil_moisture=15, rain_probability=5, temperature=40
        ))
        assert result.irrigation_decision == DECISION_IRRIGATE
        assert "temperature" in result.reason.lower() or "urgent" in result.reason.lower()


# ==================================================================
# SCENARIO 3: Adequate soil moisture → NO_ACTION
# ==================================================================
class TestNoActionDecision:
    """FarmSense should recommend NO_ACTION when soil moisture is adequate."""

    def test_no_action_basic(self):
        """Adequate soil (50%) → NO_ACTION regardless of rain."""
        result = analyze(_telemetry(soil_moisture=50, rain_probability=30))
        assert result.irrigation_decision == DECISION_NO_ACTION

    def test_no_action_with_high_rain(self):
        """Adequate soil + high rain → still NO_ACTION."""
        result = analyze(_telemetry(soil_moisture=60, rain_probability=90))
        assert result.irrigation_decision == DECISION_NO_ACTION

    def test_no_action_zero_delay(self):
        """NO_ACTION should have 0 delay hours."""
        result = analyze(_telemetry(soil_moisture=50))
        assert result.delay_hours == 0

    def test_no_action_still_reports_water_saved(self):
        """NO_ACTION saves water (we didn't irrigate)."""
        result = analyze(_telemetry(soil_moisture=50))
        assert result.water_saved_l > 0

    def test_no_action_reason_mentions_adequate(self):
        """The reason should confirm moisture is adequate."""
        result = analyze(_telemetry(soil_moisture=50))
        assert "adequate" in result.reason.lower()


# ==================================================================
# SCENARIO 4: Invalid / missing input
# ==================================================================
class TestInvalidInput:
    """FarmSense should reject invalid or missing telemetry gracefully."""

    def test_missing_field(self):
        """Omitting a required field should raise ValidationError."""
        incomplete = {
            "temperature": 30,
            "humidity": 60,
            # soil_moisture is missing
            "rain_probability": 30,
            "wind_speed": 10,
            "crop": "Tomato",
            "crop_stage": "Flowering",
        }
        with pytest.raises(ValidationError):
            analyze(incomplete)

    def test_out_of_range_temperature(self):
        """Temperature outside -10..60 should raise ValidationError."""
        with pytest.raises(ValidationError):
            analyze(_telemetry(temperature=100))

    def test_negative_humidity(self):
        """Negative humidity should raise ValidationError."""
        with pytest.raises(ValidationError):
            analyze(_telemetry(humidity=-5))

    def test_soil_moisture_over_100(self):
        """Soil moisture > 100% should raise ValidationError."""
        with pytest.raises(ValidationError):
            analyze(_telemetry(soil_moisture=150))

    def test_empty_crop_name(self):
        """Empty crop name should raise ValidationError."""
        with pytest.raises(ValidationError):
            analyze(_telemetry(crop=""))

    def test_empty_dict(self):
        """Empty dict should raise ValidationError."""
        with pytest.raises(ValidationError):
            analyze({})


# ==================================================================
# SCENARIO 5: Water savings calculation
# ==================================================================
class TestWaterSavings:
    """Verify water savings estimates are sensible."""

    def test_delay_saves_water(self):
        """DELAY should save a meaningful amount of water."""
        result = analyze(_telemetry(soil_moisture=27, rain_probability=78))
        assert result.water_saved_l > 0

    def test_irrigate_saves_nothing(self):
        """IRRIGATE means we're using water — savings should be 0."""
        result = analyze(_telemetry(soil_moisture=20, rain_probability=10))
        assert result.water_saved_l == 0

    def test_no_action_saves_water(self):
        """NO_ACTION means we didn't irrigate — should report savings."""
        result = analyze(_telemetry(soil_moisture=50))
        assert result.water_saved_l > 0

    def test_different_crop_stages_different_savings(self):
        """Fruiting stage should save more water than Harvest stage."""
        fruiting = analyze(_telemetry(soil_moisture=50, crop_stage="Fruiting"))
        harvest = analyze(_telemetry(soil_moisture=50, crop_stage="Harvest"))
        assert fruiting.water_saved_l > harvest.water_saved_l


# ==================================================================
# Output structure
# ==================================================================
class TestOutputStructure:
    """Verify the output contains all required fields and is JSON-serializable."""

    def test_required_fields_present(self):
        """All four required fields must be in the response."""
        result = analyze(_telemetry())
        data = result.model_dump()
        assert "irrigation_decision" in data
        assert "delay_hours" in data
        assert "water_saved_l" in data
        assert "reason" in data

    def test_agent_field(self):
        """The agent field should identify FARMSENSE."""
        result = analyze(_telemetry())
        assert result.agent == "FARMSENSE"

    def test_json_serializable(self):
        """Output must be JSON-serializable for downstream agents."""
        import json
        result = analyze(_telemetry())
        json_str = json.dumps(result.model_dump())
        assert isinstance(json_str, str)

    def test_telemetry_summary_included(self):
        """Response should echo key telemetry for traceability."""
        result = analyze(_telemetry(soil_moisture=27))
        assert result.telemetry_summary is not None
        assert result.telemetry_summary["soil_moisture"] == 27
