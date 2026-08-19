"""
CropGuard — Agent 2: PREDICT
Deterministic Rule-Based Predictor

Pipeline:
    FarmInput
        → Input validated (Pydantic, model.py)
        → Feature extraction
        → Crop health score  (0–100)
        → Stress level       (LOW / MODERATE / HIGH)
        → Yield estimate     (kg, per prototype acreage)
        → Harvest window     (human-readable string)
        → Disease risk       (LOW / MODERATE / HIGH)
        → CropGuardOutput

All calculations are transparent and deterministic.
No trained model or external dataset is required.
"""

from __future__ import annotations

import math

from .model import (
    CROP_BASELINE_KG_TOTAL,
    DISEASE_RISK_THRESHOLDS,
    FACTOR_WEIGHTS,
    OPTIMAL_RANGES,
    PENALTY_SCALE,
    PROTOTYPE_ACRES,
    STAGE_HARVEST_WINDOW,
    STAGE_YIELD_MULTIPLIER,
    CropGuardOutput,
    DiseaseRisk,
    FarmInput,
    FarmSenseInput,
    StressLevel,
)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _deviation_penalty(value: float, opt_min: float, opt_max: float, scale: float) -> float:
    """
    Returns a penalty in [0.0, 1.0] based on how far *value* sits outside
    the optimal band [opt_min, opt_max].

    • Inside the band → 0.0 (no penalty)
    • Beyond the band by *scale* or more → 1.0 (maximum penalty)
    """
    if value < opt_min:
        deviation = opt_min - value
    elif value > opt_max:
        deviation = value - opt_max
    else:
        return 0.0

    return min(deviation / scale, 1.0)


def _normalise_key(key: str) -> str:
    """Lower-case and strip a lookup key."""
    return key.strip().lower()


# ---------------------------------------------------------------------------
# 1. Crop Health Score
# ---------------------------------------------------------------------------

def compute_crop_health(farm: FarmInput) -> int:
    """
    Compute a crop health score from 0 to 100.

    Method
    ------
    Each environmental factor contributes a weighted penalty when it
    falls outside its optimal range.  The aggregate penalty is subtracted
    from a perfect score of 100.

        health = 100 × (1 − Σ weight_i × penalty_i)

    Crop-stage sensitivity modifier
    --------------------------------
    Flowering is the most sensitive stage.  A small stage multiplier
    amplifies the penalty slightly during critical periods.

    Returns
    -------
    int
        Score clamped to [0, 100].
    """
    factors = {
        "temperature":  farm.temperature,
        "humidity":     farm.humidity,
        "soil_moisture": farm.soil_moisture,
        "wind_speed":   farm.wind_speed,
    }

    weighted_penalty = 0.0
    for factor, value in factors.items():
        opt_min, opt_max = OPTIMAL_RANGES[factor]
        scale = PENALTY_SCALE[factor]
        weight = FACTOR_WEIGHTS[factor]
        penalty = _deviation_penalty(value, opt_min, opt_max, scale)
        weighted_penalty += weight * penalty

    # Stage sensitivity — flowering/fruiting are most vulnerable
    stage_key = _normalise_key(farm.crop_stage)
    stage_sensitivity = {
        "seedling":   1.00,
        "vegetative": 1.00,
        "flowering":  1.10,   # +10% penalty amplification
        "fruiting":   1.05,
        "ripening":   1.00,
        "harvest":    1.00,
    }.get(stage_key, 1.00)

    total_penalty = min(weighted_penalty * stage_sensitivity, 1.0)
    raw_score = 100.0 * (1.0 - total_penalty)

    # FarmSense signal: if irrigation is delayed due to rain, soil stress is
    # expected to resolve soon — apply a small optimism offset.
    # (predictor intentionally does not import FarmSenseInput directly here;
    #  the caller may pass an explicit offset via apply_farmsense_adjustment)
    return int(round(max(0.0, min(100.0, raw_score))))


def apply_farmsense_adjustment(health_score: int, farmsense: FarmSenseInput | None) -> int:
    """
    Apply a minor upward correction to health_score when FarmSense indicates
    rain-based irrigation deferral (meaning soil stress will soon be relieved).

    Adjustment: +3 points if irrigation is delayed due to rain.
    Capped at 100.
    """
    if farmsense is None:
        return health_score

    decision = (farmsense.irrigation_decision or "").upper()
    reason = (farmsense.reason or "").lower()

    if decision == "DELAY" and "rain" in reason:
        health_score = min(health_score + 3, 100)

    return health_score


# ---------------------------------------------------------------------------
# 2. Stress Level
# ---------------------------------------------------------------------------

def compute_stress_level(health_score: int) -> StressLevel:
    """
    Derive stress level from health score.

        ≥ 83  → LOW       (well above typical growing comfort zone)
        55–82 → MODERATE  (some environmental pressure, crop coping)
        < 55  → HIGH      (significant stress — intervention warranted)

    Thresholds are calibrated so the FarmFlow demo scenario
    (health ≈ 80, temp=34°C, soil=27%) correctly maps to MODERATE.
    """
    if health_score >= 83:
        return StressLevel.LOW
    if health_score >= 55:
        return StressLevel.MODERATE
    return StressLevel.HIGH


# ---------------------------------------------------------------------------
# 3. Expected Yield
# ---------------------------------------------------------------------------

def compute_expected_yield(farm: FarmInput, health_score: int) -> float:
    """
    Estimate total expected yield in kg for the prototype farm.

    Formula
    -------
        yield = CROP_BASELINE_KG_TOTAL × stage_multiplier × health_factor

    Where:
    - ``CROP_BASELINE_KG_TOTAL`` is the realistic total-farm yield under
      ideal conditions (pre-calibrated for PROTOTYPE_ACRES = 12 acres).
    - ``stage_multiplier`` accounts for how much of the yield is already
      locked in at the current crop stage.
    - ``health_factor = health_score / 100`` scales linearly with crop
      condition.

    Assumption
    ----------
    Acreage is not present in the FarmFlow shared input contract.
    The baseline already encodes PROTOTYPE_ACRES (12). See README.md § Assumptions.

    Returns
    -------
    float
        Rounded to one decimal place.
    """
    crop_key = _normalise_key(farm.crop)
    stage_key = _normalise_key(farm.crop_stage)

    baseline = CROP_BASELINE_KG_TOTAL.get(
        crop_key, CROP_BASELINE_KG_TOTAL["_default"]
    )
    stage_mult = STAGE_YIELD_MULTIPLIER.get(
        stage_key, STAGE_YIELD_MULTIPLIER["_default"]
    )
    health_factor = health_score / 100.0

    raw_yield = baseline * stage_mult * health_factor
    return round(raw_yield, 1)


# ---------------------------------------------------------------------------
# 4. Harvest Window
# ---------------------------------------------------------------------------

def compute_harvest_window(farm: FarmInput) -> str:
    """
    Return a human-readable harvest window based on crop growth stage.
    """
    stage_key = _normalise_key(farm.crop_stage)
    return STAGE_HARVEST_WINDOW.get(stage_key, STAGE_HARVEST_WINDOW["_default"])


# ---------------------------------------------------------------------------
# 5. Disease Risk
# ---------------------------------------------------------------------------

def compute_disease_risk(farm: FarmInput) -> DiseaseRisk:
    """
    Estimate disease outbreak risk from environmental stress indicators.

    Composite score
    ---------------
    High temperature above optimal, high humidity, and high rain probability
    all contribute to a disease-risk composite (0–100).

        temp_risk     = penalty if temperature > optimal_max (heat + humidity → fungal)
        humidity_risk = penalty if humidity > optimal_max
        rain_risk     = rain_probability (direct %)

        composite = 0.3 × temp_score + 0.4 × humidity_score + 0.3 × rain_risk

    Thresholds
    ----------
        composite ≥ 70 → HIGH
        composite ≥ 40 → MODERATE
        otherwise      → LOW
    """
    # Temperature risk — only elevated temp above band matters for disease
    temp_opt_min, temp_opt_max = OPTIMAL_RANGES["temperature"]
    if farm.temperature > temp_opt_max:
        temp_score = min((farm.temperature - temp_opt_max) / PENALTY_SCALE["temperature"], 1.0) * 100.0
    else:
        temp_score = 0.0

    # Humidity risk — excess humidity drives fungal/bacterial outbreaks
    hum_opt_min, hum_opt_max = OPTIMAL_RANGES["humidity"]
    if farm.humidity > hum_opt_max:
        hum_score = min((farm.humidity - hum_opt_max) / PENALTY_SCALE["humidity"], 1.0) * 100.0
    else:
        hum_score = 0.0

    rain_score = farm.rain_probability  # already 0–100

    composite = (
        0.30 * temp_score
        + 0.40 * hum_score
        + 0.30 * rain_score
    )

    if composite >= DISEASE_RISK_THRESHOLDS["HIGH"]:
        return DiseaseRisk.HIGH
    if composite >= DISEASE_RISK_THRESHOLDS["MODERATE"]:
        return DiseaseRisk.MODERATE
    return DiseaseRisk.LOW


# ---------------------------------------------------------------------------
# Main prediction entry point
# ---------------------------------------------------------------------------

def predict(farm: FarmInput, farmsense: FarmSenseInput | None = None) -> CropGuardOutput:
    """
    Run the full CropGuard prediction pipeline.

    Parameters
    ----------
    farm : FarmInput
        Validated telemetry from FarmSense / shared contract.
    farmsense : FarmSenseInput | None
        Optional structured FarmSense output (Agent 1).

    Returns
    -------
    CropGuardOutput
        Structured prediction result matching the shared output contract.
    """
    # Step 1 — Crop health score
    health_score = compute_crop_health(farm)

    # Step 2 — Apply FarmSense signal (if available)
    health_score = apply_farmsense_adjustment(health_score, farmsense)

    # Step 3 — Stress level
    stress_level = compute_stress_level(health_score)

    # Step 4 — Expected yield
    expected_yield_kg = compute_expected_yield(farm, health_score)

    # Step 5 — Harvest window
    harvest_window = compute_harvest_window(farm)

    # Step 6 — Disease risk
    disease_risk = compute_disease_risk(farm)

    return CropGuardOutput(
        crop_health=health_score,
        stress_level=stress_level,
        expected_yield_kg=expected_yield_kg,
        harvest_window=harvest_window,
        disease_risk=disease_risk,
    )
