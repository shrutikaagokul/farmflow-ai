"""
FarmFlow AI — API Server
=========================

Lightweight FastAPI server exposing the multi-agent pipeline.

Run:
    python -m uvicorn server:app --port 8000 --reload

Endpoints:
    POST /api/farmsense    — Analyze farm telemetry (Agent 1: SENSE)
    POST /api/cropguard    — Predict crop health     (Agent 2: PREDICT)
    POST /api/marketmind   — Match harvest to demand (Agent 3: MATCH)
    POST /api/actionflow   — Full pipeline → action plan (Agent 4: ACT)
    GET  /health           — Health check
    GET  /docs             — Auto-generated API docs (Swagger UI)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from typing import Optional

from agents.farmsense.agent import analyze as farmsense_analyze
from agents.farmsense.models import FarmTelemetry
from agents.cropguard.predictor import predict as cropguard_predict
from agents.cropguard.model import FarmInput, FarmSenseInput
from agents.marketmind.marketmind import run_marketmind
from agents.actionflow.logic import run_actionflow
from auth.routes import router as auth_router

app = FastAPI(
    title="FarmFlow AI — Agent API",
    description="Multi-agent precision agriculture backend. SENSE → PREDICT → MATCH → ACT.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])

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
    return {"status": "ok", "agents": ["farmsense", "cropguard", "marketmind", "actionflow"]}


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
        result = farmsense_analyze(telemetry)
        return result.model_dump()
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# ActionFlow pipeline endpoint (full SENSE → PREDICT → MATCH → ACT)
# ---------------------------------------------------------------------------

class ActionFlowRequest(BaseModel):
    """
    Request body for the full ActionFlow pipeline.

    Requires farm telemetry and market destinations.
    Runs all four agents in sequence and returns the prioritised action plan.
    """
    # Farm telemetry (same as FarmSense input)
    temperature: float
    humidity: float
    soil_moisture: float
    rain_probability: float
    wind_speed: float
    crop: str
    crop_stage: str

    # Market demand / destinations (for MarketMind)
    market_demand: Optional[float] = None
    destinations: Optional[dict] = None

    # Optional overrides
    price_per_kg: Optional[float] = None


# Default market destinations for the demo scenario
_DEFAULT_DESTINATIONS = {
    "market_a": 950,
    "restaurants": 180,
    "food_rescue": 200,
    "ngo": 90,
}


@app.post("/api/actionflow")
def actionflow_endpoint(request: ActionFlowRequest):
    """
    Run the full FarmFlow AI pipeline: SENSE → PREDICT → MATCH → ACT.

    Returns the complete ActionFlow output with prioritised action plan.
    """
    try:
        # Step 1: FarmSense (SENSE)
        telemetry_dict = {
            "temperature": request.temperature,
            "humidity": request.humidity,
            "soil_moisture": request.soil_moisture,
            "rain_probability": request.rain_probability,
            "wind_speed": request.wind_speed,
            "crop": request.crop,
            "crop_stage": request.crop_stage,
        }
        farmsense_result = farmsense_analyze(telemetry_dict)
        farmsense_dict = farmsense_result.model_dump()

        # Step 2: CropGuard (PREDICT)
        farm_input = FarmInput(**telemetry_dict)
        farmsense_input = FarmSenseInput(
            irrigation_decision=farmsense_result.irrigation_decision,
            delay_hours=farmsense_result.delay_hours,
            water_saved_l=farmsense_result.water_saved_l,
            reason=farmsense_result.reason,
        )
        cropguard_result = cropguard_predict(farm=farm_input, farmsense=farmsense_input)
        cropguard_dict = cropguard_result.model_dump()

        # Step 3: MarketMind (MATCH)
        destinations = request.destinations or _DEFAULT_DESTINATIONS
        marketmind_input = {
            "expected_yield_kg": cropguard_result.expected_yield_kg,
            "crop": request.crop,
            "destinations": destinations,
        }
        if request.market_demand is not None:
            marketmind_input["market_demand"] = request.market_demand
        if request.price_per_kg is not None:
            marketmind_input["price_per_kg"] = request.price_per_kg
        marketmind_dict = run_marketmind(marketmind_input)

        # Step 4: ActionFlow (ACT)
        actionflow_result = run_actionflow(farmsense_dict, cropguard_dict, marketmind_dict)

        return {
            "pipeline": {
                "farmsense": farmsense_dict,
                "cropguard": cropguard_dict,
                "marketmind": marketmind_dict,
            },
            "actionflow": actionflow_result,
        }

    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

