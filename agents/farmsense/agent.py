"""
FarmSense — Agent Entry Point
===============================

This is the public interface for the FarmSense agent.

Usage from Python (e.g., by CropGuard or any downstream agent):

    from agents.farmsense.agent import analyze

    result = analyze({
        "temperature": 34,
        "humidity": 61,
        "soil_moisture": 27,
        "rain_probability": 78,
        "wind_speed": 14,
        "crop": "Tomato",
        "crop_stage": "Flowering",
    })

    print(result.irrigation_decision)  # "DELAY"
    print(result.model_dump())         # Full JSON-serializable dict

Usage from the API:
    POST /api/farmsense with the same JSON body.
"""

from agents.farmsense.models import FarmTelemetry, FarmSenseResponse
from agents.farmsense.logic import make_decision


def analyze(telemetry_input: dict | FarmTelemetry) -> FarmSenseResponse:
    """
    Analyze farm telemetry and produce an irrigation decision.

    Accepts either a raw dict (from API/JSON) or a pre-validated
    FarmTelemetry object (from another agent).

    Returns a FarmSenseResponse with:
        - irrigation_decision: IRRIGATE | DELAY | NO_ACTION
        - delay_hours: recommended wait time (0 if not delaying)
        - water_saved_l: estimated litres saved
        - reason: human-readable explanation

    Raises:
        pydantic.ValidationError: If input data is invalid or missing
            required fields.
    """

    # If it's already a FarmTelemetry, use it directly.
    # Otherwise, validate the raw dict through Pydantic.
    if isinstance(telemetry_input, FarmTelemetry):
        telemetry = telemetry_input
    else:
        telemetry = FarmTelemetry(**telemetry_input)

    return make_decision(telemetry)
