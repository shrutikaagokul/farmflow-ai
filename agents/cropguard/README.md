# CropGuard — Agent 2: PREDICT

Part of the **FarmFlow AI** autonomous farm-to-market intelligence pipeline.

```
SENSE (FarmSense) → PREDICT (CropGuard) → MATCH (MarketMind) → ACT (ActionFlow)
```

---

## What CropGuard Does

CropGuard answers:

> **"How is the crop doing, and what yield can we expect?"**

Given environmental telemetry and an optional FarmSense signal, it produces
structured crop intelligence that MarketMind and ActionFlow consume.

---

## Output Contract

Field names **must not be renamed** — other agents depend on them.

```json
{
  "crop_health":       82,
  "stress_level":      "MODERATE",
  "expected_yield_kg": 1420.0,
  "harvest_window":    "5–7 days",
  "disease_risk":      "LOW"
}
```

| Field | Type | Description |
|---|---|---|
| `crop_health` | `int` 0–100 | Overall crop health score |
| `stress_level` | `"LOW" \| "MODERATE" \| "HIGH"` | Derived stress classification |
| `expected_yield_kg` | `float` | Projected yield in kg |
| `harvest_window` | `string` | Days to optimal harvest |
| `disease_risk` | `"LOW" \| "MODERATE" \| "HIGH"` | Disease outbreak risk |

---

## Input Contract

```json
{
  "farm": {
    "temperature":      34,
    "humidity":         61,
    "soil_moisture":    27,
    "rain_probability": 78,
    "wind_speed":       14,
    "crop":             "Tomato",
    "crop_stage":       "Flowering"
  },
  "farmsense": {
    "irrigation_decision": "DELAY",
    "delay_hours":         8,
    "water_saved_l":       1800,
    "reason":              "High rain probability detected"
  }
}
```

`farmsense` is optional — CropGuard runs independently.

---

## Assumptions

> **⚠️ PROTOTYPE DEFAULT — Acreage**
>
> The shared FarmFlow input contract does **not** include an `acreage` field.
> CropGuard uses a documented default of **12 acres** (`PROTOTYPE_ACRES = 12.0`)
> to compute absolute yield estimates. This matches the FarmFlow demo scenario
> (12-acre Tomato farm, Karnataka).
>
> When the shared input contract is updated to include acreage, pass it as an
> optional `acreage` field in `FarmInput` and `predictor.py` will use it.
> Until then the 12-acre default applies and is clearly labelled in `model.py`.

---

## Implementation Approach

**Deterministic rule-based engine** (no trained model required for Round 1).

### Crop Health Score (0–100)

Each environmental factor is scored against its optimal range and weighted:

| Factor | Weight | Optimal Range |
|---|---|---|
| Temperature | 35% | 20–32 °C |
| Soil Moisture | 30% | 35–65 % |
| Humidity | 20% | 50–75 % |
| Wind Speed | 15% | 0–15 km/h |

`health = 100 × (1 − Σ weight × penalty)` — with a stage sensitivity multiplier
(Flowering/Fruiting add 5–10% penalty amplification).

### Stress Level

| Health Score | Stress Level |
|---|---|
| ≥ 75 | LOW |
| 50–74 | MODERATE |
| < 50 | HIGH |

### Expected Yield

```
yield = baseline_kg_per_acre × stage_multiplier × (health / 100) × PROTOTYPE_ACRES
```

### Harvest Window

Derived from `crop_stage` using a lookup table.

### Disease Risk

Composite of temperature excess + humidity excess + rain probability.
Scored LOW / MODERATE / HIGH.

---

## File Structure

```
agents/cropguard/
├── __init__.py           ← Package init
├── agent.py              ← FastAPI app (POST /cropguard, GET /health)
├── model.py              ← Pydantic schemas + reference tables
├── predictor.py          ← Deterministic prediction engine
├── requirements.txt      ← Python dependencies
├── README.md             ← This file
└── tests/
    ├── __init__.py
    └── test_cropguard.py ← 4 required tests + demo regression
```

---

## Running Locally

```bash
cd agents/cropguard
pip install -r requirements.txt

# Start the API server
uvicorn agent:app --reload --port 8001
```

API docs available at: `http://localhost:8001/docs`

---

## Running Tests

```bash
# From repo root
pytest agents/cropguard/tests/ -v

# Or from within agents/cropguard/
cd agents/cropguard
pytest tests/ -v
```

---

## Integration Guide (Team Lead)

### Connecting FarmSense → CropGuard → MarketMind → ActionFlow

CropGuard is intentionally stateless. The pipeline works like this:

```python
# Step 1 — FarmSense output (SENSE)
farmsense_output = {
    "irrigation_decision": "DELAY",
    "delay_hours": 8,
    "water_saved_l": 1800,
    "reason": "High rain probability detected",
}

# Step 2 — CropGuard input (PREDICT)
import requests

response = requests.post("http://localhost:8001/cropguard", json={
    "farm": {
        "temperature": 34,
        "humidity": 61,
        "soil_moisture": 27,
        "rain_probability": 78,
        "wind_speed": 14,
        "crop": "Tomato",
        "crop_stage": "Flowering",
    },
    "farmsense": farmsense_output,
})

cropguard_output = response.json()
# {
#   "crop_health": 82,
#   "stress_level": "MODERATE",
#   "expected_yield_kg": 1420.0,
#   "harvest_window": "5–7 days",
#   "disease_risk": "LOW"
# }

# Step 3 — Pass cropguard_output to MarketMind (MATCH)
# Step 4 — Pass combined result to ActionFlow (ACT)
```

### Or use directly as a Python module (no HTTP required)

```python
from agents.cropguard import predict, FarmInput, FarmSenseInput

result = predict(
    farm=FarmInput(
        temperature=34, humidity=61, soil_moisture=27,
        rain_probability=78, wind_speed=14,
        crop="Tomato", crop_stage="Flowering",
    ),
    farmsense=FarmSenseInput(
        irrigation_decision="DELAY",
        reason="High rain probability detected",
    ),
)

print(result.model_dump())
```

---

## Git Safety

- Branch: `cropguard-agent`
- No changes to any frontend files
- No changes to `src/data/mockData.js`
- No changes to other agents' code
- Do not merge to `main` without team lead review
