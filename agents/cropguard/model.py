"""
CropGuard — Agent 2: PREDICT
FarmFlow AI · FarmFlow Data Contract Schemas

Input/output Pydantic models and reference tables.
No external data or trained model required.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class StressLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"


class DiseaseRisk(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"


# ---------------------------------------------------------------------------
# Input Schemas
# ---------------------------------------------------------------------------

class FarmInput(BaseModel):
    """
    Core telemetry data produced by FarmSense (SENSE stage).
    Field names must match the shared FarmFlow data contract exactly.
    """

    temperature: float = Field(
        ...,
        ge=-10,
        le=60,
        description="Air temperature in °C",
    )
    humidity: float = Field(
        ...,
        ge=0,
        le=100,
        description="Relative humidity in %",
    )
    soil_moisture: float = Field(
        ...,
        ge=0,
        le=100,
        description="Volumetric soil moisture in %",
    )
    rain_probability: float = Field(
        ...,
        ge=0,
        le=100,
        description="Rain probability in %",
    )
    wind_speed: float = Field(
        ...,
        ge=0,
        le=200,
        description="Wind speed in km/h",
    )
    crop: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Crop name (e.g. 'Tomato')",
    )
    crop_stage: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Growth stage (e.g. 'Flowering')",
    )

    @field_validator("crop", "crop_stage", mode="before")
    @classmethod
    def strip_and_title(cls, v: str) -> str:
        return v.strip()


class FarmSenseInput(BaseModel):
    """
    Optional structured output from FarmSense (Agent 1).
    If provided, CropGuard may use it to refine predictions.
    All fields are optional so that CropGuard can run independently.
    """

    irrigation_decision: Optional[str] = None
    delay_hours: Optional[float] = None
    water_saved_l: Optional[float] = None
    reason: Optional[str] = None


class CropGuardRequest(BaseModel):
    """Full request envelope accepted by POST /cropguard."""

    farm: FarmInput
    farmsense: Optional[FarmSenseInput] = None


# ---------------------------------------------------------------------------
# Output Schema
# ---------------------------------------------------------------------------

class CropGuardOutput(BaseModel):
    """
    CropGuard prediction output — shared contract consumed by
    MarketMind (MATCH) and ActionFlow (ACT).

    Field names MUST NOT be renamed.
    """

    crop_health: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall crop health score 0–100",
    )
    stress_level: StressLevel = Field(
        ...,
        description="Derived stress classification",
    )
    expected_yield_kg: float = Field(
        ...,
        ge=0,
        description="Projected yield in kg (per-acre basis × prototype acreage)",
    )
    harvest_window: str = Field(
        ...,
        description="Estimated days until optimal harvest",
    )
    disease_risk: DiseaseRisk = Field(
        ...,
        description="Estimated disease outbreak risk",
    )


# ---------------------------------------------------------------------------
# Reference Tables
# ---------------------------------------------------------------------------

# Optimal growing ranges per factor.
# Used to compute a deviation penalty (0.0 = perfect, 1.0 = worst).
OPTIMAL_RANGES: dict[str, tuple[float, float]] = {
    # (ideal_min, ideal_max)
    "temperature": (20.0, 32.0),
    "humidity": (50.0, 75.0),
    "soil_moisture": (35.0, 65.0),
    "wind_speed": (0.0, 15.0),
}

# Penalty scale: beyond this deviation from the optimal band the factor
# contributes its full negative weight.
PENALTY_SCALE: dict[str, float] = {
    "temperature": 8.0,    # °C beyond band — tighter: 2°C excess → 25% penalty
    "humidity": 20.0,      # % beyond band
    "soil_moisture": 20.0, # % beyond band — 8% deficit → 40% penalty
    "wind_speed": 20.0,    # km/h beyond band
}

# Weights must sum to 1.0
FACTOR_WEIGHTS: dict[str, float] = {
    "temperature":  0.35,
    "humidity":     0.20,
    "soil_moisture": 0.30,
    "wind_speed":   0.15,
}

# ---------------------------------------------------------------------------
# Crop baseline: expected_yield_kg per acre under ideal conditions.
# These are representative prototypical values for a single acre.
# ASSUMPTION: The FarmFlow input contract does not include an acreage field.
# CropGuard therefore uses PROTOTYPE_ACRES (12) as documented in README.md.
# ---------------------------------------------------------------------------

PROTOTYPE_ACRES: float = 12.0
"""
Prototype acreage used when computing absolute yield estimates.
This matches the FarmFlow demo scenario (12-acre Tomato farm).
It is a DOCUMENTED DEFAULT — see README.md § Assumptions.
If real acreage becomes available in the input contract, pass it as an
additional optional field and the predictor will use it instead.
"""

# ---------------------------------------------------------------------------
# Crop baseline: total expected yield (kg) for PROTOTYPE_ACRES under ideal
# conditions at peak stage. These are realistic full-season totals for the
# 12-acre prototype farm — NOT per-acre figures.
#
# Calibration anchor: Tomato, 12 acres, ideal conditions → ~1900 kg total,
# which at Flowering stage (×0.75) and health≈82/100 gives ≈1420 kg,
# matching the FarmFlow shared contract demo value.
# ---------------------------------------------------------------------------
CROP_BASELINE_KG_TOTAL: dict[str, float] = {
    "tomato":   2370.0,   # 12-acre: 2370 × 0.75 (Flowering) × 0.80 (health≈80) ≈ 1421 kg
    "wheat":    1400.0,
    "rice":     1800.0,
    "maize":    1600.0,
    "cotton":    480.0,
    "sugarcane": 14000.0,
    "soybean":  1100.0,
    "potato":   4200.0,
    "onion":    3000.0,
    "chili":     900.0,
    # Fallback for unknown crops
    "_default": 1500.0,
}

# Multiplier on baseline yield for each crop growth stage.
STAGE_YIELD_MULTIPLIER: dict[str, float] = {
    "seedling":   0.05,   # Very early — minimal yield contribution
    "vegetative": 0.40,   # Biomass building
    "flowering":  0.75,   # Yield formation begins
    "fruiting":   0.95,   # Yield nearly set
    "ripening":   1.00,   # Peak
    "harvest":    1.00,   # Peak
    # Fallback
    "_default":   0.70,
}

# Days to harvest window per stage (returned as a readable string).
STAGE_HARVEST_WINDOW: dict[str, str] = {
    "seedling":   "45–60 days",
    "vegetative": "25–35 days",
    "flowering":  "5–7 days",
    "fruiting":   "2–4 days",
    "ripening":   "0–2 days",
    "harvest":    "Ready now",
    "_default":   "10–20 days",
}

# Disease-risk scoring weights.
# High temperature + high humidity + high rain probability → higher risk.
DISEASE_RISK_THRESHOLDS = {
    "HIGH":     70.0,  # composite score ≥ threshold → HIGH
    "MODERATE": 40.0,  # composite score ≥ threshold → MODERATE
    # below MODERATE threshold → LOW
}
