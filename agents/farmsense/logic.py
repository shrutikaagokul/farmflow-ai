"""
FarmSense — Decision Logic
============================

Transparent, threshold-based irrigation decision engine.

This is the core brain of the FarmSense agent. It takes validated
telemetry and produces a structured decision using configurable
thresholds from config.py.

NO LLM. NO BLACK BOX. Every decision is traceable.

Decision Matrix:
┌────────────────────┬──────────────────────┬──────────────┐
│ Soil Moisture      │ Rain Probability     │ Decision     │
├────────────────────┼──────────────────────┼──────────────┤
│ LOW  (< threshold) │ LOW  (< threshold)   │ IRRIGATE     │
│ LOW  (< threshold) │ HIGH (>= threshold)  │ DELAY        │
│ OK   (>= threshold)│ any                  │ NO_ACTION    │
└────────────────────┴──────────────────────┴──────────────┘
"""

from agents.farmsense.models import FarmTelemetry, FarmSenseResponse
from agents.farmsense.config import (
    SOIL_MOISTURE_LOW_THRESHOLD,
    RAIN_PROBABILITY_HIGH_THRESHOLD,
    HIGH_TEMP_THRESHOLD,
    LOW_HUMIDITY_THRESHOLD,
    BASE_WATER_USAGE_L_PER_ACRE,
    DEFAULT_FARM_ACRES,
    CROP_STAGE_WATER_MULTIPLIER,
    DEFAULT_STAGE_MULTIPLIER,
    MAX_DELAY_HOURS,
    MIN_DELAY_HOURS,
    DECISION_IRRIGATE,
    DECISION_DELAY,
    DECISION_NO_ACTION,
)


def _calculate_delay_hours(rain_probability: float) -> int:
    """
    Estimate how many hours to delay irrigation.

    Higher rain probability → shorter delay (rain arrives sooner).
    Clamped to [MIN_DELAY_HOURS, MAX_DELAY_HOURS].
    """
    raw = MAX_DELAY_HOURS - (rain_probability / 100) * (MAX_DELAY_HOURS - MIN_DELAY_HOURS)
    return max(MIN_DELAY_HOURS, min(MAX_DELAY_HOURS, round(raw)))


def _calculate_water_saved(crop_stage: str) -> int:
    """
    Estimate litres of water saved when irrigation is delayed or skipped.

    Formula:
        water_saved = BASE_WATER_USAGE_L_PER_ACRE × FARM_ACRES × stage_multiplier

    This is a hackathon prototype estimate, not a scientific model.
    The calculation is intentionally simple and configurable.
    """
    multiplier = CROP_STAGE_WATER_MULTIPLIER.get(crop_stage, DEFAULT_STAGE_MULTIPLIER)
    return round(BASE_WATER_USAGE_L_PER_ACRE * DEFAULT_FARM_ACRES * multiplier)


def _build_reason(
    decision: str,
    telemetry: FarmTelemetry,
    delay_hours: int,
) -> str:
    """Build a human-readable reason string from the decision context."""

    parts = []

    if decision == DECISION_DELAY:
        parts.append(
            f"High rain probability detected ({telemetry.rain_probability:.0f}%). "
            f"Delaying irrigation by ~{delay_hours}h to conserve water."
        )
        if telemetry.soil_moisture < SOIL_MOISTURE_LOW_THRESHOLD:
            parts.append(
                f"Soil moisture is low ({telemetry.soil_moisture:.0f}%) "
                f"but natural precipitation is expected."
            )

    elif decision == DECISION_IRRIGATE:
        parts.append(
            f"Soil moisture is low ({telemetry.soil_moisture:.0f}%) "
            f"and rain probability is low ({telemetry.rain_probability:.0f}%). "
            f"Irrigation recommended."
        )
        if telemetry.temperature > HIGH_TEMP_THRESHOLD:
            parts.append(
                f"High temperature ({telemetry.temperature:.0f}°C) "
                f"increases evapotranspiration — irrigation is urgent."
            )
        if telemetry.humidity < LOW_HUMIDITY_THRESHOLD:
            parts.append(
                f"Low humidity ({telemetry.humidity:.0f}%) "
                f"accelerates soil drying."
            )

    elif decision == DECISION_NO_ACTION:
        parts.append(
            f"Soil moisture is adequate ({telemetry.soil_moisture:.0f}%). "
            f"No immediate irrigation needed."
        )

    # Add crop context
    parts.append(f"Crop: {telemetry.crop} ({telemetry.crop_stage} stage).")

    return " ".join(parts)


def _assess_confidence(telemetry: FarmTelemetry, decision: str) -> str:
    """
    Qualitative confidence assessment based on how clearly the
    telemetry points toward the decision.
    """
    soil_gap = abs(telemetry.soil_moisture - SOIL_MOISTURE_LOW_THRESHOLD)
    rain_gap = abs(telemetry.rain_probability - RAIN_PROBABILITY_HIGH_THRESHOLD)

    # If both indicators are far from thresholds, we're confident.
    if soil_gap > 15 and rain_gap > 20:
        return "HIGH"
    elif soil_gap > 5 or rain_gap > 10:
        return "MEDIUM"
    else:
        return "LOW"


def make_decision(telemetry: FarmTelemetry) -> FarmSenseResponse:
    """
    Core decision function.

    Takes validated FarmTelemetry and returns a FarmSenseResponse
    with the irrigation decision, delay hours, water saved estimate,
    and a human-readable reason.
    """

    soil_is_low = telemetry.soil_moisture < SOIL_MOISTURE_LOW_THRESHOLD
    rain_is_likely = telemetry.rain_probability >= RAIN_PROBABILITY_HIGH_THRESHOLD

    # ---- Primary decision logic ----
    if soil_is_low and not rain_is_likely:
        decision = DECISION_IRRIGATE
        delay_hours = 0
        water_saved = 0  # We're using water, not saving it

    elif soil_is_low and rain_is_likely:
        decision = DECISION_DELAY
        delay_hours = _calculate_delay_hours(telemetry.rain_probability)
        water_saved = _calculate_water_saved(telemetry.crop_stage)

    else:
        # Soil moisture is adequate
        decision = DECISION_NO_ACTION
        delay_hours = 0
        water_saved = _calculate_water_saved(telemetry.crop_stage)

    # ---- Build response ----
    reason = _build_reason(decision, telemetry, delay_hours)
    confidence = _assess_confidence(telemetry, decision)

    return FarmSenseResponse(
        irrigation_decision=decision,
        delay_hours=delay_hours,
        water_saved_l=water_saved,
        reason=reason,
        agent="FARMSENSE",
        confidence=confidence,
        telemetry_summary={
            "soil_moisture": telemetry.soil_moisture,
            "rain_probability": telemetry.rain_probability,
            "temperature": telemetry.temperature,
            "humidity": telemetry.humidity,
            "crop": telemetry.crop,
            "crop_stage": telemetry.crop_stage,
        },
    )
