"""
CropGuard — Agent 2: PREDICT
FastAPI Application

Endpoints
---------
POST /cropguard
    Run the CropGuard prediction pipeline.
    Accepts farm telemetry + optional FarmSense data.
    Returns crop health, stress level, expected yield, harvest window, disease risk.

GET /health
    Liveness check.

Usage
-----
    uvicorn agents.cropguard.agent:app --reload --port 8001
    # or from within agents/cropguard/
    uvicorn agent:app --reload --port 8001
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from .model import CropGuardOutput, CropGuardRequest
from .predictor import predict

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="CropGuard — FarmFlow AI Agent 2",
    description=(
        "Predicts crop health, stress level, expected yield, harvest window, "
        "and disease risk from environmental telemetry. "
        "Part of the FarmFlow AI SENSE → PREDICT → MATCH → ACT pipeline."
    ),
    version="1.0.0",
)

# Allow the Vite frontend (dev: http://localhost:5173) to call this API
# during local development without CORS errors.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", tags=["Ops"])
def health_check() -> dict:
    """Liveness check — confirms the agent is running."""
    return {"agent": "CropGuard", "status": "OK", "version": "1.0.0"}


@app.post(
    "/cropguard",
    response_model=CropGuardOutput,
    tags=["CropGuard"],
    summary="Predict crop condition and yield",
    response_description="Crop health, stress, yield, harvest window, disease risk",
)
def cropguard_predict(request: CropGuardRequest) -> CropGuardOutput:
    """
    Run the CropGuard prediction pipeline.

    **Input** (shared FarmFlow data contract):
    ```json
    {
        "farm": {
            "temperature": 34,
            "humidity": 61,
            "soil_moisture": 27,
            "rain_probability": 78,
            "wind_speed": 14,
            "crop": "Tomato",
            "crop_stage": "Flowering"
        },
        "farmsense": {
            "irrigation_decision": "DELAY",
            "delay_hours": 8,
            "water_saved_l": 1800,
            "reason": "High rain probability detected"
        }
    }
    ```

    **Output** (shared CropGuard output contract):
    ```json
    {
        "crop_health": 82,
        "stress_level": "MODERATE",
        "expected_yield_kg": 1420.0,
        "harvest_window": "5-7 days",
        "disease_risk": "LOW"
    }
    ```
    """
    try:
        result = predict(farm=request.farm, farmsense=request.farmsense)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction error: {exc}") from exc

    return result


# ---------------------------------------------------------------------------
# Convenience: run directly with `python agent.py`
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("agent:app", host="0.0.0.0", port=8001, reload=True)
