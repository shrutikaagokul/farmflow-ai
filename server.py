"""
FarmFlow AI — API Server
=========================

Lightweight FastAPI server exposing the FarmSense agent.

Run:
    python -m uvicorn server:app --port 8000 --reload

Endpoints:
    POST /api/farmsense  — Analyze farm telemetry
    GET  /health         — Health check
    GET  /docs           — Auto-generated API docs (Swagger UI)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from agents.farmsense.agent import analyze
from agents.farmsense.models import FarmTelemetry

app = FastAPI(
    title="FarmFlow AI — Agent API",
    description="Multi-agent precision agriculture backend. Currently serving: FarmSense.",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite frontend (or any client) to call the API
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hackathon: open CORS. Lock this down in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    """Simple health check for the API server."""
    return {"status": "ok", "agents": ["farmsense"]}


# ---------------------------------------------------------------------------
# FarmSense endpoint
# ---------------------------------------------------------------------------
@app.post("/api/farmsense")
def farmsense_endpoint(telemetry: FarmTelemetry):
    """
    Analyze farm telemetry and return an irrigation decision.

    Accepts a FarmTelemetry JSON body and returns a FarmSenseResponse.

    Example request:
    ```json
    {
        "temperature": 34,
        "humidity": 61,
        "soil_moisture": 27,
        "rain_probability": 78,
        "wind_speed": 14,
        "crop": "Tomato",
        "crop_stage": "Flowering"
    }
    ```
    """
    try:
        result = analyze(telemetry)
        return result.model_dump()
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
