"""
FarmSense — Data Models
========================

Pydantic models for input validation and structured output.
These define the contract between FarmSense and any consumer
(API endpoint, downstream agents, tests).
"""

from pydantic import BaseModel, Field
from typing import Optional


class FarmTelemetry(BaseModel):
    """
    Input telemetry from the farm.

    All fields are required. Validation ensures values are within
    physically plausible ranges.
    """

    temperature: float = Field(
        ...,
        ge=-10,
        le=60,
        description="Ambient temperature in °C",
    )
    humidity: float = Field(
        ...,
        ge=0,
        le=100,
        description="Relative humidity as percentage (0–100)",
    )
    soil_moisture: float = Field(
        ...,
        ge=0,
        le=100,
        description="Soil moisture as percentage (0–100)",
    )
    rain_probability: float = Field(
        ...,
        ge=0,
        le=100,
        description="Probability of rain as percentage (0–100)",
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
        description="Crop type (e.g., 'Tomato', 'Rice', 'Wheat')",
    )
    crop_stage: str = Field(
        ...,
        min_length=1,
        description="Current growth stage (e.g., 'Flowering', 'Vegetative')",
    )


class FarmSenseResponse(BaseModel):
    """
    Structured output from the FarmSense agent.

    The four required fields (irrigation_decision, delay_hours,
    water_saved_l, reason) are the contract that downstream agents
    like CropGuard will consume.

    Additional fields provide supporting context.
    """

    # --- Required fields (DO NOT rename) ---
    irrigation_decision: str = Field(
        ...,
        description="One of: IRRIGATE, DELAY, NO_ACTION",
    )
    delay_hours: int = Field(
        ...,
        ge=0,
        description="Recommended delay in hours (0 if IRRIGATE or NO_ACTION)",
    )
    water_saved_l: int = Field(
        ...,
        ge=0,
        description="Estimated litres of water saved by this decision",
    )
    reason: str = Field(
        ...,
        description="Human-readable explanation of the decision",
    )

    # --- Supporting context for downstream agents ---
    agent: str = Field(
        default="FARMSENSE",
        description="Agent identifier",
    )
    confidence: Optional[str] = Field(
        default=None,
        description="Qualitative confidence level (HIGH, MEDIUM, LOW)",
    )
    telemetry_summary: Optional[dict] = Field(
        default=None,
        description="Echo of key input values for traceability",
    )
