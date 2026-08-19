"""
ActionFlow — Core Decision Engine
====================================

Orchestration agent that synthesizes outputs from FarmSense, CropGuard,
and MarketMind into a prioritized, explainable action plan.

Pipeline:
    FarmSense output ─────┐
                          │
    CropGuard output ─────┼──→ Validate → Identify Risks
                          │         → Detect Conflicts
    MarketMind output ────┘         → Generate Actions
                                    → Score & Prioritize
                                    → Produce Explanations
                                    → Final Action Plan

All decisions are deterministic and traceable.
NO LLM. NO BLACK BOX. Every action is explainable.
"""

from __future__ import annotations

from agents.actionflow.models import (
    # Action categories
    ACTION_IRRIGATE,
    ACTION_DELAY_IRRIGATION,
    ACTION_MONITOR_CROP_STRESS,
    ACTION_ADDRESS_CROP_STRESS,
    ACTION_PREPARE_FOR_HARVEST,
    ACTION_REDIRECT_SURPLUS,
    ACTION_EXPEDITE_SURPLUS_RESCUE,
    ACTION_MONITOR_DISEASE_RISK,
    ACTION_NO_URGENT_ACTION,
    # Status levels
    STATUS_NORMAL,
    STATUS_ATTENTION_REQUIRED,
    STATUS_CRITICAL,
    # Urgency
    URGENCY_HIGH,
    URGENCY_MEDIUM,
    URGENCY_LOW,
    # Priority scoring
    PRIORITY_HIGH_THRESHOLD,
    PRIORITY_MEDIUM_THRESHOLD,
    WEIGHT_URGENCY,
    WEIGHT_SEVERITY,
    WEIGHT_POTENTIAL_LOSS,
    WEIGHT_CROSS_AGENT,
    WEIGHT_FEASIBILITY,
    # Validation
    FARMSENSE_REQUIRED_KEYS,
    CROPGUARD_REQUIRED_KEYS,
    MARKETMIND_REQUIRED_KEYS,
)


# ──────────────────────────────────────────────────────────────────────
# 1. INPUT VALIDATION
# ──────────────────────────────────────────────────────────────────────

def _validate_agent_output(output, required_keys: set, agent_name: str) -> dict:
    """
    Validate that an agent output is a dict containing all required keys.

    Raises ValueError with a clear message if validation fails.
    Returns the dict unchanged if valid.
    """
    if not isinstance(output, dict):
        raise ValueError(f"{agent_name} output must be a dictionary, got {type(output).__name__}")

    missing = required_keys - set(output.keys())
    if missing:
        raise ValueError(
            f"{agent_name} output is missing required keys: {sorted(missing)}"
        )
    return output


def _validate_inputs(farmsense: dict, cropguard: dict, marketmind: dict) -> None:
    """Validate all three agent outputs."""
    _validate_agent_output(farmsense, FARMSENSE_REQUIRED_KEYS, "FarmSense")
    _validate_agent_output(cropguard, CROPGUARD_REQUIRED_KEYS, "CropGuard")
    _validate_agent_output(marketmind, MARKETMIND_REQUIRED_KEYS, "MarketMind")


# ──────────────────────────────────────────────────────────────────────
# 2. RISK IDENTIFICATION
# ──────────────────────────────────────────────────────────────────────

def _extract_risks(farmsense: dict, cropguard: dict, marketmind: dict) -> dict:
    """
    Extract structured risk signals from all three agent outputs.

    Returns a dict of boolean/string flags for downstream logic.
    """
    irrigation_decision = farmsense.get("irrigation_decision", "").upper()
    raw_stress = str(cropguard.get("stress_level", "")).upper()
    stress_level = raw_stress.split(".")[-1] if "." in raw_stress else raw_stress
    raw_disease = str(cropguard.get("disease_risk", "")).upper()
    disease_risk = raw_disease.split(".")[-1] if "." in raw_disease else raw_disease
    surplus_level = str(marketmind.get("surplus_level", "")).upper()
    waste_risk = str(marketmind.get("waste_risk_level", "")).upper()

    # Telemetry signals (may be nested in telemetry_summary)
    telemetry = farmsense.get("telemetry_summary", {}) or {}
    soil_moisture = telemetry.get("soil_moisture")
    rain_probability = telemetry.get("rain_probability")
    temperature = telemetry.get("temperature")

    return {
        # FarmSense signals
        "needs_irrigation": irrigation_decision == "IRRIGATE",
        "irrigation_delayed": irrigation_decision == "DELAY",
        "irrigation_ok": irrigation_decision == "NO_ACTION",
        "irrigation_decision": irrigation_decision,
        "delay_hours": farmsense.get("delay_hours", 0),
        "water_saved_l": farmsense.get("water_saved_l", 0),
        "soil_moisture": soil_moisture,
        "rain_probability": rain_probability,
        "temperature": temperature,

        # CropGuard signals
        "crop_health": cropguard.get("crop_health", 0),
        "stress_high": stress_level == "HIGH",
        "stress_moderate": stress_level == "MODERATE",
        "stress_low": stress_level == "LOW",
        "stress_level": stress_level,
        "expected_yield_kg": cropguard.get("expected_yield_kg", 0),
        "harvest_window": cropguard.get("harvest_window", ""),
        "disease_risk_high": disease_risk == "HIGH",
        "disease_risk_moderate": disease_risk == "MODERATE",
        "disease_risk": disease_risk,

        # MarketMind signals
        "surplus_kg": marketmind.get("surplus_kg", 0),
        "surplus_critical": surplus_level == "CRITICAL_SURPLUS",
        "surplus_moderate": surplus_level == "MODERATE_SURPLUS",
        "surplus_low": surplus_level == "LOW_SURPLUS",
        "surplus_balanced": surplus_level == "BALANCED",
        "surplus_level": surplus_level,
        "waste_risk_high": waste_risk == "HIGH",
        "waste_risk_moderate": waste_risk == "MODERATE",
        "waste_risk_level": waste_risk,
        "remaining_unallocated_kg": marketmind.get("remaining_unallocated_kg", 0),
        "food_rescued_kg": marketmind.get("food_rescued_kg", 0),
        "economic_value_recovered_inr": marketmind.get("economic_value_recovered_inr", 0),
        "economic_value_at_risk_inr": marketmind.get("economic_value_at_risk_inr", 0),
    }


# ──────────────────────────────────────────────────────────────────────
# 3. PRIORITY SCORING
# ──────────────────────────────────────────────────────────────────────

def _compute_priority_score(
    urgency: float,
    severity: float,
    potential_loss: float,
    cross_agent: float,
    feasibility: float = 80.0,
) -> float:
    """
    Compute a priority score (0–100) using the weighted scoring model.

    Each input factor is on a 0–100 scale:
        urgency        (30%) — time sensitivity
        severity       (25%) — how bad the risk is
        potential_loss (20%) — economic / yield impact
        cross_agent    (15%) — multiple agents reinforcing
        feasibility    (10%) — how actionable

    Returns a float score in [0, 100].
    """
    score = (
        WEIGHT_URGENCY * urgency
        + WEIGHT_SEVERITY * severity
        + WEIGHT_POTENTIAL_LOSS * potential_loss
        + WEIGHT_CROSS_AGENT * cross_agent
        + WEIGHT_FEASIBILITY * feasibility
    )
    return min(100.0, max(0.0, round(score, 1)))


def _score_to_urgency(score: float) -> str:
    """Map a numeric priority score to an urgency label."""
    if score >= PRIORITY_HIGH_THRESHOLD:
        return URGENCY_HIGH
    if score >= PRIORITY_MEDIUM_THRESHOLD:
        return URGENCY_MEDIUM
    return URGENCY_LOW


# ──────────────────────────────────────────────────────────────────────
# 4. FORMAT HELPERS
# ──────────────────────────────────────────────────────────────────────

def _format_num(val) -> str:
    """Format a numeric value for human-readable output."""
    if val is None:
        return "N/A"
    if isinstance(val, int):
        return f"{val:,}"
    if isinstance(val, float):
        if val.is_integer():
            return f"{int(val):,}"
        return f"{val:,.1f}"
    return str(val)


def _action_title(action: str) -> str:
    """Convert an ACTION_* constant to a human-readable title."""
    titles = {
        ACTION_IRRIGATE: "Irrigate Now",
        ACTION_DELAY_IRRIGATION: "Delay Irrigation",
        ACTION_MONITOR_CROP_STRESS: "Monitor Crop Stress",
        ACTION_ADDRESS_CROP_STRESS: "Address Crop Stress",
        ACTION_PREPARE_FOR_HARVEST: "Prepare for Harvest",
        ACTION_REDIRECT_SURPLUS: "Redirect Surplus",
        ACTION_EXPEDITE_SURPLUS_RESCUE: "Expedite Surplus Rescue",
        ACTION_MONITOR_DISEASE_RISK: "Monitor Disease Risk",
        ACTION_NO_URGENT_ACTION: "No Urgent Action Required",
    }
    return titles.get(action, action.replace("_", " ").title())


# ──────────────────────────────────────────────────────────────────────
# 5. CANDIDATE ACTION GENERATION (with cross-agent reasoning)
# ──────────────────────────────────────────────────────────────────────

def _generate_candidate_actions(risks: dict) -> list[dict]:
    """
    Generate candidate actions from the extracted risk signals.

    Each candidate is a dict with:
        action, title, impact, reason, source_agents,
        urgency_score, severity_score, loss_score, cross_agent_score

    Cross-agent reasoning is embedded directly: when multiple agents
    reinforce a concern, the cross_agent_score is elevated and the
    reason references both sources.
    """
    candidates = []

    # ── A. IRRIGATION ACTIONS ──────────────────────────────────────

    if risks["needs_irrigation"]:
        # FarmSense says irrigate — check if CropGuard reinforces
        cross = 0.0
        reason_parts = []

        if risks["soil_moisture"] is not None:
            reason_parts.append(
                f"Soil moisture is low ({_format_num(risks['soil_moisture'])}%)"
            )
        if risks["rain_probability"] is not None:
            reason_parts.append(
                f"rain probability is low ({_format_num(risks['rain_probability'])}%)"
            )
        reason_parts.append("Irrigation is recommended immediately.")

        source_agents = ["FARMSENSE"]

        # Cross-agent amplification: stress reinforces irrigation urgency
        if risks["stress_high"]:
            cross = 90.0
            reason_parts.append(
                "CropGuard confirms HIGH crop stress, making irrigation urgent."
            )
            source_agents.append("CROPGUARD")
        elif risks["stress_moderate"]:
            cross = 50.0
            reason_parts.append(
                "CropGuard reports MODERATE crop stress, reinforcing the need to irrigate."
            )
            source_agents.append("CROPGUARD")

        candidates.append({
            "action": ACTION_IRRIGATE,
            "title": _action_title(ACTION_IRRIGATE),
            "impact": "Restore soil moisture to optimal levels",
            "reason": " ".join(reason_parts),
            "source_agents": source_agents,
            "urgency_score": 95.0 if risks["stress_high"] else 90.0,
            "severity_score": 85.0 if risks["stress_high"] else 70.0,
            "loss_score": 70.0,
            "cross_agent_score": cross,
        })

    elif risks["irrigation_delayed"]:
        # FarmSense says delay — check for conflict with CropGuard stress
        delay_h = risks["delay_hours"]
        water_saved = risks["water_saved_l"]
        source_agents = ["FARMSENSE"]
        reason_parts = []

        if risks["rain_probability"] is not None:
            reason_parts.append(
                f"Rain probability is {_format_num(risks['rain_probability'])}%."
            )
        if delay_h:
            reason_parts.append(
                f"Delaying irrigation by approximately {delay_h} hours to conserve water."
            )

        impact = f"Save approximately {_format_num(water_saved)} L water"

        # Cross-agent conflict: delay vs. stress
        cross = 0.0
        urgency = 60.0

        if risks["stress_high"]:
            # Conflict: rain expected but crop is stressed
            reason_parts.append(
                "Note: CropGuard reports HIGH crop stress. "
                "Monitor closely — if rainfall does not materialise within "
                f"{delay_h} hours, irrigate immediately."
            )
            source_agents.append("CROPGUARD")
            cross = 60.0
            urgency = 70.0
        elif risks["stress_moderate"]:
            reason_parts.append(
                "CropGuard reports MODERATE stress. "
                "Expected rainfall should provide relief, but continue monitoring."
            )
            source_agents.append("CROPGUARD")
            cross = 30.0

        if risks["soil_moisture"] is not None:
            reason_parts.append(
                f"Soil moisture currently at {_format_num(risks['soil_moisture'])}% "
                "will be replenished naturally."
            )

        candidates.append({
            "action": ACTION_DELAY_IRRIGATION,
            "title": _action_title(ACTION_DELAY_IRRIGATION),
            "impact": impact,
            "reason": " ".join(reason_parts),
            "source_agents": source_agents,
            "urgency_score": urgency,
            "severity_score": 40.0,
            "loss_score": 20.0,
            "cross_agent_score": cross,
        })

    # ── B. CROP STRESS ACTIONS ─────────────────────────────────────

    if risks["stress_high"]:
        reason_parts = [
            f"Crop health is at {risks['crop_health']}/100 with HIGH stress level."
        ]
        source_agents = ["CROPGUARD"]
        cross = 0.0

        if risks["temperature"] is not None and risks["temperature"] > 35:
            reason_parts.append(
                f"High temperature ({_format_num(risks['temperature'])}°C) is contributing to stress."
            )

        # Cross-agent: if irrigation is also needed, reference it
        if risks["needs_irrigation"]:
            reason_parts.append(
                "Irrigation has been recommended by FarmSense and will help alleviate stress."
            )
            source_agents.append("FARMSENSE")
            cross = 50.0
        elif risks["irrigation_delayed"]:
            reason_parts.append(
                "Irrigation is delayed due to expected rainfall. "
                "Monitor stress levels until precipitation arrives."
            )
            source_agents.append("FARMSENSE")
            cross = 40.0

        candidates.append({
            "action": ACTION_ADDRESS_CROP_STRESS,
            "title": _action_title(ACTION_ADDRESS_CROP_STRESS),
            "impact": f"Crop health at {risks['crop_health']}/100 — intervention needed",
            "reason": " ".join(reason_parts),
            "source_agents": sorted(set(source_agents)),
            "urgency_score": 80.0,
            "severity_score": 85.0,
            "loss_score": 60.0,
            "cross_agent_score": cross,
        })

    elif risks["stress_moderate"]:
        reason_parts = [
            f"Crop health is at {risks['crop_health']}/100 with MODERATE stress."
        ]
        source_agents = ["CROPGUARD"]

        if risks["temperature"] is not None and risks["temperature"] > 32:
            reason_parts.append(
                f"Temperature at {_format_num(risks['temperature'])}°C is contributing to heat stress."
            )

        reason_parts.append(
            "Continue monitoring for signs of escalation."
        )

        candidates.append({
            "action": ACTION_MONITOR_CROP_STRESS,
            "title": _action_title(ACTION_MONITOR_CROP_STRESS),
            "impact": f"Moderate stress detected (health: {risks['crop_health']}/100)",
            "reason": " ".join(reason_parts),
            "source_agents": source_agents,
            "urgency_score": 45.0,
            "severity_score": 50.0,
            "loss_score": 30.0,
            "cross_agent_score": 0.0,
        })

    # ── C. HARVEST PREPARATION ─────────────────────────────────────

    harvest_window = risks["harvest_window"]
    expected_yield = risks.get("expected_yield_kg", 0)
    if harvest_window and expected_yield > 0:
        # Check if harvest is approaching (contains small numbers or "Ready")
        is_imminent = any(
            kw in harvest_window.lower()
            for kw in ["ready", "0–2", "0-2", "2–4", "2-4", "5–7", "5-7"]
        )
        if is_imminent:
            source_agents = ["CROPGUARD"]
            cross = 0.0
            reason_parts = [
                f"Harvest window is {harvest_window}."
            ]

            if expected_yield:
                reason_parts.append(
                    f"Expected yield: {_format_num(expected_yield)} kg."
                )

            # Cross-agent: surplus affects harvest planning
            if not risks["surplus_balanced"]:
                reason_parts.append(
                    f"MarketMind reports {risks['surplus_level'].replace('_', ' ').lower()} — "
                    "coordinate harvest logistics with market allocation."
                )
                source_agents.append("MARKETMIND")
                cross = 30.0

            reason_parts.append(
                "Stage logistics for optimal freshness and distribution."
            )

            candidates.append({
                "action": ACTION_PREPARE_FOR_HARVEST,
                "title": _action_title(ACTION_PREPARE_FOR_HARVEST),
                "impact": f"{harvest_window} window — {_format_num(expected_yield)} kg",
                "reason": " ".join(reason_parts),
                "source_agents": sorted(set(source_agents)),
                "urgency_score": 40.0,
                "severity_score": 20.0,
                "loss_score": 30.0,
                "cross_agent_score": cross,
            })

    # ── D. SURPLUS / WASTE ACTIONS ─────────────────────────────────

    if risks["waste_risk_high"] or (risks["surplus_critical"] and risks["remaining_unallocated_kg"] > 0):
        # Urgent surplus rescue
        unallocated = risks["remaining_unallocated_kg"]
        surplus = risks["surplus_kg"]
        source_agents = ["MARKETMIND"]
        cross = 0.0
        reason_parts = []

        reason_parts.append(
            f"{_format_num(surplus)} kg surplus detected with "
            f"{_format_num(unallocated)} kg remaining unallocated."
        )
        reason_parts.append(
            "Waste risk is HIGH. Immediate action required to prevent food waste."
        )

        # Cross-agent: CropGuard yield drove the surplus
        expected_yield = risks["expected_yield_kg"]
        if expected_yield and surplus:
            reason_parts.append(
                f"CropGuard projected {_format_num(expected_yield)} kg yield, "
                "which exceeds current market absorption capacity."
            )
            source_agents.append("CROPGUARD")
            cross = 50.0

        econ = risks["economic_value_recovered_inr"]
        impact = f"{_format_num(unallocated)} kg needs immediate rescue routing"
        if econ:
            impact += f" (₹{_format_num(econ)} at stake)"

        candidates.append({
            "action": ACTION_EXPEDITE_SURPLUS_RESCUE,
            "title": _action_title(ACTION_EXPEDITE_SURPLUS_RESCUE),
            "impact": impact,
            "reason": " ".join(reason_parts),
            "source_agents": sorted(set(source_agents)),
            "urgency_score": 85.0,
            "severity_score": 80.0,
            "loss_score": 75.0,
            "cross_agent_score": cross,
        })

    elif not risks["surplus_balanced"] and risks["surplus_kg"] > 0:
        # Non-critical surplus — route to rescue
        surplus = risks["surplus_kg"]
        rescued = risks["food_rescued_kg"]
        unallocated = risks["remaining_unallocated_kg"]
        source_agents = ["MARKETMIND"]
        cross = 0.0
        reason_parts = []

        if unallocated > 0:
            reason_parts.append(
                f"{_format_num(surplus)} kg surplus detected. "
                f"{_format_num(rescued)} kg redirected to rescue channels, "
                f"{_format_num(unallocated)} kg still unallocated."
            )
        else:
            reason_parts.append(
                f"{_format_num(surplus)} kg surplus detected. "
                f"All surplus successfully redirected to rescue channels."
            )

        # Cross-agent: expected yield context
        expected_yield = risks["expected_yield_kg"]
        if expected_yield:
            reason_parts.append(
                f"Projected yield of {_format_num(expected_yield)} kg "
                "exceeds commercial demand."
            )
            source_agents.append("CROPGUARD")
            cross = 30.0

        econ = risks["economic_value_recovered_inr"]
        if econ:
            impact = f"{_format_num(surplus)} kg → Food Rescue (₹{_format_num(econ)} value recovered)"
        else:
            impact = f"{_format_num(surplus)} kg → Food Rescue / NGO channels"

        urgency = 55.0
        severity = 45.0
        if risks["surplus_moderate"] or risks["surplus_critical"]:
            urgency = 65.0
            severity = 60.0

        candidates.append({
            "action": ACTION_REDIRECT_SURPLUS,
            "title": _action_title(ACTION_REDIRECT_SURPLUS),
            "impact": impact,
            "reason": " ".join(reason_parts),
            "source_agents": sorted(set(source_agents)),
            "urgency_score": urgency,
            "severity_score": severity,
            "loss_score": 50.0,
            "cross_agent_score": cross,
        })

    # ── E. DISEASE RISK MONITORING ─────────────────────────────────

    if risks["disease_risk_high"] or risks["disease_risk_moderate"]:
        level = risks["disease_risk"]
        reason_parts = [f"Disease risk is {level}."]
        source_agents = ["CROPGUARD"]

        if risks["temperature"] is not None and risks["temperature"] > 32:
            reason_parts.append(
                f"Elevated temperature ({_format_num(risks['temperature'])}°C) "
                "combined with humidity increases disease pressure."
            )

        if risks["rain_probability"] is not None and risks["rain_probability"] > 50:
            reason_parts.append(
                f"High rain probability ({_format_num(risks['rain_probability'])}%) "
                "may create fungal-favourable conditions."
            )
            source_agents.append("FARMSENSE")

        reason_parts.append("Inspect crops for early signs of disease.")

        urgency = 70.0 if risks["disease_risk_high"] else 45.0
        severity = 75.0 if risks["disease_risk_high"] else 45.0

        candidates.append({
            "action": ACTION_MONITOR_DISEASE_RISK,
            "title": _action_title(ACTION_MONITOR_DISEASE_RISK),
            "impact": f"{level} disease risk — preventive inspection recommended",
            "reason": " ".join(reason_parts),
            "source_agents": sorted(set(source_agents)),
            "urgency_score": urgency,
            "severity_score": severity,
            "loss_score": 40.0,
            "cross_agent_score": 20.0 if len(source_agents) > 1 else 0.0,
        })

    # ── F. FALLBACK: NO URGENT ACTION ──────────────────────────────

    if not candidates:
        candidates.append({
            "action": ACTION_NO_URGENT_ACTION,
            "title": _action_title(ACTION_NO_URGENT_ACTION),
            "impact": "All systems operating within normal parameters",
            "reason": (
                "FarmSense reports adequate soil moisture. "
                "CropGuard shows healthy crop conditions. "
                "MarketMind confirms balanced market allocation. "
                "No immediate intervention is required."
            ),
            "source_agents": ["FARMSENSE", "CROPGUARD", "MARKETMIND"],
            "urgency_score": 10.0,
            "severity_score": 10.0,
            "loss_score": 0.0,
            "cross_agent_score": 0.0,
        })

    return candidates


# ──────────────────────────────────────────────────────────────────────
# 6. ACTION PRIORITISATION & ASSEMBLY
# ──────────────────────────────────────────────────────────────────────

def _prioritise_actions(candidates: list[dict]) -> list[dict]:
    """
    Score each candidate, sort by priority, and assemble the final
    action list with priority numbers and urgency labels.
    """
    scored = []
    for c in candidates:
        score = _compute_priority_score(
            urgency=c["urgency_score"],
            severity=c["severity_score"],
            potential_loss=c["loss_score"],
            cross_agent=c["cross_agent_score"],
        )
        scored.append({
            **c,
            "priority_score": score,
            "urgency": _score_to_urgency(score),
        })

    # Sort by priority score descending (highest priority first)
    scored.sort(key=lambda x: x["priority_score"], reverse=True)

    # Assign priority numbers (1 = highest)
    actions = []
    for i, s in enumerate(scored, start=1):
        actions.append({
            "priority": i,
            "action": s["action"],
            "urgency": s["urgency"],
            "title": s["title"],
            "impact": s["impact"],
            "reason": s["reason"],
            "source_agents": s["source_agents"],
            "priority_score": s["priority_score"],
        })

    return actions


# ──────────────────────────────────────────────────────────────────────
# 7. OVERALL STATUS & REASON
# ──────────────────────────────────────────────────────────────────────

def _compute_overall_status(actions: list[dict], risks: dict) -> str:
    """
    Determine the overall farm status from the prioritised actions.

    CRITICAL:  any HIGH-urgency action with critical risk
    ATTENTION: any MEDIUM or HIGH-urgency action
    NORMAL:    only LOW-urgency actions
    """
    if not actions:
        return STATUS_NORMAL

    top_urgency = actions[0]["urgency"]

    # CRITICAL if top action is HIGH and involves critical risks
    if top_urgency == URGENCY_HIGH:
        critical_signals = (
            risks.get("stress_high", False)
            or risks.get("waste_risk_high", False)
            or risks.get("surplus_critical", False)
            or risks.get("disease_risk_high", False)
        )
        if critical_signals:
            return STATUS_CRITICAL
        return STATUS_ATTENTION_REQUIRED

    if top_urgency == URGENCY_MEDIUM:
        return STATUS_ATTENTION_REQUIRED

    return STATUS_NORMAL


def _build_overall_reason(actions: list[dict], risks: dict) -> str:
    """Build a concise overall summary from the top actions."""
    if not actions:
        return "All farm systems are operating normally."

    if actions[0]["action"] == ACTION_NO_URGENT_ACTION:
        return "All farm systems are operating normally. No immediate intervention is required."

    parts = []
    high_actions = [a for a in actions if a["urgency"] == URGENCY_HIGH]
    other_actions = [a for a in actions if a["urgency"] != URGENCY_HIGH]

    if high_actions:
        titles = [a["title"] for a in high_actions]
        if len(titles) == 1:
            parts.append(f"Priority action: {titles[0]}.")
        else:
            parts.append(f"Priority actions: {', '.join(titles)}.")

    if other_actions:
        parts.append(f"{len(other_actions)} additional action(s) recommended.")

    return " ".join(parts)


def _build_risk_summary(risks: dict) -> dict:
    """Build a compact risk summary from the extracted risks."""
    return {
        "irrigation_status": risks.get("irrigation_decision", "UNKNOWN"),
        "crop_stress": risks.get("stress_level", "UNKNOWN"),
        "disease_risk": risks.get("disease_risk", "UNKNOWN"),
        "surplus_status": risks.get("surplus_level", "UNKNOWN"),
        "waste_risk": risks.get("waste_risk_level", "UNKNOWN"),
    }


# ──────────────────────────────────────────────────────────────────────
# 8. MAIN ENTRY POINT
# ──────────────────────────────────────────────────────────────────────

def run_actionflow(
    farmsense: dict,
    cropguard: dict,
    marketmind: dict,
) -> dict:
    """
    Run the ActionFlow orchestration pipeline.

    Parameters
    ----------
    farmsense : dict
        Output from FarmSense agent (or .model_dump() of FarmSenseResponse).
    cropguard : dict
        Output from CropGuard agent (or .model_dump() of CropGuardOutput).
    marketmind : dict
        Output from MarketMind agent (run_marketmind return value).

    Returns
    -------
    dict
        JSON-serializable action plan with:
        - agent: "ACTIONFLOW"
        - overall_status: NORMAL | ATTENTION_REQUIRED | CRITICAL
        - priority_actions: list of prioritised actions
        - overall_reason: human-readable summary
        - risk_summary: compact risk flags

    Raises
    ------
    ValueError
        If any agent output is missing required fields.
    """
    # Step 1 — Validate inputs
    _validate_inputs(farmsense, cropguard, marketmind)

    # Step 2 — Extract risk signals
    risks = _extract_risks(farmsense, cropguard, marketmind)

    # Step 3 — Generate candidate actions (with cross-agent reasoning)
    candidates = _generate_candidate_actions(risks)

    # Step 4 — Score, sort, and assemble prioritised actions
    priority_actions = _prioritise_actions(candidates)

    # Step 5 — Compute overall status and summary
    overall_status = _compute_overall_status(priority_actions, risks)
    overall_reason = _build_overall_reason(priority_actions, risks)
    risk_summary = _build_risk_summary(risks)

    return {
        "agent": "ACTIONFLOW",
        "overall_status": overall_status,
        "priority_actions": priority_actions,
        "overall_reason": overall_reason,
        "risk_summary": risk_summary,
    }
