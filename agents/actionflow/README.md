# ActionFlow — Agent 4: ACT

> **Orchestration & Decision Agent**
> Final agent in the FarmFlow pipeline: **SENSE → PREDICT → MATCH → ACT**

## Purpose

ActionFlow consumes the outputs of three specialist agents and produces a **prioritized, explainable action plan** for the farmer.

```
FarmSense output ─────┐
                      │
CropGuard output ─────┼──→ ACTIONFLOW ──→ Prioritized Action Plan
                      │
MarketMind output ────┘
```

## Input Contract

ActionFlow accepts three dictionaries — one from each upstream agent:

### FarmSense Output (required keys)
| Key | Type | Description |
|---|---|---|
| `irrigation_decision` | `str` | `IRRIGATE`, `DELAY`, `NO_ACTION` |
| `delay_hours` | `int` | Hours to delay |
| `water_saved_l` | `int` | Litres saved |
| `reason` | `str` | Human-readable explanation |

### CropGuard Output (required keys)
| Key | Type | Description |
|---|---|---|
| `crop_health` | `int` | 0–100 health score |
| `stress_level` | `str` | `LOW`, `MODERATE`, `HIGH` |
| `expected_yield_kg` | `float` | Projected yield in kg |
| `harvest_window` | `str` | Days until optimal harvest |
| `disease_risk` | `str` | `LOW`, `MODERATE`, `HIGH` |

### MarketMind Output (required keys)
| Key | Type | Description |
|---|---|---|
| `surplus_kg` | `float` | Surplus quantity |
| `surplus_level` | `str` | `BALANCED`, `LOW_SURPLUS`, `MODERATE_SURPLUS`, `CRITICAL_SURPLUS` |
| `waste_risk_level` | `str` | `NONE`, `LOW`, `MODERATE`, `HIGH` |
| `remaining_unallocated_kg` | `float` | Unallocated surplus |
| `recommended_action` | `str` | MarketMind's recommendation |
| `decision_reason` | `str` | Human-readable reason |

## Output Contract

```python
{
    "agent": "ACTIONFLOW",
    "overall_status": "ATTENTION_REQUIRED",  # NORMAL | ATTENTION_REQUIRED | CRITICAL

    "priority_actions": [
        {
            "priority": 1,
            "action": "DELAY_IRRIGATION",
            "urgency": "HIGH",
            "title": "Delay Irrigation",
            "impact": "Save approximately 1,800 L water",
            "reason": "Rain probability is 78%. Delaying irrigation by approximately 4 hours...",
            "source_agents": ["FARMSENSE", "CROPGUARD"],
            "priority_score": 72.5
        }
    ],

    "overall_reason": "Priority action: Delay Irrigation. 2 additional action(s) recommended.",

    "risk_summary": {
        "irrigation_status": "DELAY",
        "crop_stress": "MODERATE",
        "disease_risk": "LOW",
        "surplus_status": "LOW_SURPLUS",
        "waste_risk": "NONE"
    }
}
```

## Decision Logic

### Pipeline Stages

1. **Input Validation** — Verify required keys from all three agents
2. **Risk Identification** — Extract boolean/string risk signals
3. **Candidate Action Generation** — Create actions with cross-agent reasoning
4. **Priority Scoring** — Weighted scoring model (0–100 scale)
5. **Prioritisation** — Sort by score, assign priority numbers
6. **Overall Status** — Aggregate farm health status
7. **Explanation Assembly** — Build human-readable summaries

### Priority Scoring Model

| Factor | Weight | Description |
|---|---|---|
| Urgency | 30% | Time sensitivity of the risk |
| Severity | 25% | How severe the risk is |
| Potential Loss | 20% | Economic or yield impact |
| Cross-Agent | 15% | Multiple agents reinforcing the concern |
| Feasibility | 10% | How immediately actionable |

**Score → Urgency mapping:**
- ≥ 65 → `HIGH`
- ≥ 35 → `MEDIUM`
- < 35 → `LOW`

### Cross-Agent Conflict Resolution

| Scenario | Resolution |
|---|---|
| FarmSense IRRIGATE + CropGuard HIGH stress | **Amplify**: irrigation becomes highest priority, references both agents |
| FarmSense DELAY + CropGuard MODERATE stress | **Nuanced**: delay irrigation but acknowledge stress, monitor closely |
| FarmSense DELAY + CropGuard HIGH stress | **Conflict**: delay but set urgent monitoring, mention if rain doesn't arrive |
| CropGuard high yield + MarketMind surplus | **Compound**: surplus action references yield projection |
| MarketMind HIGH waste risk + CropGuard yield | **Urgent**: expedite surplus rescue with yield context |

## Action Categories

| Action | Description |
|---|---|
| `IRRIGATE` | Immediate irrigation recommended |
| `DELAY_IRRIGATION` | Postpone irrigation with reason |
| `MONITOR_CROP_STRESS` | Monitor elevated stress |
| `ADDRESS_CROP_STRESS` | Intervene for high stress |
| `PREPARE_FOR_HARVEST` | Harvest window approaching |
| `REDIRECT_SURPLUS` | Route surplus to rescue channels |
| `EXPEDITE_SURPLUS_RESCUE` | Urgent surplus rescue |
| `MONITOR_DISEASE_RISK` | Watch for disease outbreak |
| `NO_URGENT_ACTION` | All systems normal |

## Usage

```python
from agents.actionflow.logic import run_actionflow

result = run_actionflow(
    farmsense=farmsense_output.model_dump(),
    cropguard=cropguard_output.model_dump(),
    marketmind=marketmind_output,
)

print(result["overall_status"])          # "ATTENTION_REQUIRED"
print(result["priority_actions"][0])     # Highest priority action
```

## Testing

```bash
# ActionFlow tests only
python -m pytest agents/actionflow/test_actionflow.py -v

# Full regression suite
python -m pytest agents -v
```
