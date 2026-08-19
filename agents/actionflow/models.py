"""
ActionFlow — Data Models
=========================

Input/output schemas for the ActionFlow orchestration agent.
These define the contract between ActionFlow and any consumer
(API endpoint, frontend, tests).

ActionFlow consumes the outputs of:
    - FarmSense  (SENSE)  → irrigation / weather intelligence
    - CropGuard  (PREDICT) → crop health / stress / yield intelligence
    - MarketMind (MATCH)  → market demand / surplus / waste intelligence

And produces a prioritized, explainable action plan.
"""

from __future__ import annotations


# ──────────────────────────────────────────────────────────────────────
# Action categories
# ──────────────────────────────────────────────────────────────────────
ACTION_IRRIGATE = "IRRIGATE"
ACTION_DELAY_IRRIGATION = "DELAY_IRRIGATION"
ACTION_MONITOR_CROP_STRESS = "MONITOR_CROP_STRESS"
ACTION_ADDRESS_CROP_STRESS = "ADDRESS_CROP_STRESS"
ACTION_PREPARE_FOR_HARVEST = "PREPARE_FOR_HARVEST"
ACTION_REDIRECT_SURPLUS = "REDIRECT_SURPLUS"
ACTION_EXPEDITE_SURPLUS_RESCUE = "EXPEDITE_SURPLUS_RESCUE"
ACTION_MONITOR_DISEASE_RISK = "MONITOR_DISEASE_RISK"
ACTION_NO_URGENT_ACTION = "NO_URGENT_ACTION"

# ──────────────────────────────────────────────────────────────────────
# Overall status levels
# ──────────────────────────────────────────────────────────────────────
STATUS_NORMAL = "NORMAL"
STATUS_ATTENTION_REQUIRED = "ATTENTION_REQUIRED"
STATUS_CRITICAL = "CRITICAL"

# ──────────────────────────────────────────────────────────────────────
# Priority / urgency labels
# ──────────────────────────────────────────────────────────────────────
URGENCY_HIGH = "HIGH"
URGENCY_MEDIUM = "MEDIUM"
URGENCY_LOW = "LOW"

# ──────────────────────────────────────────────────────────────────────
# Priority scoring thresholds
# ──────────────────────────────────────────────────────────────────────
PRIORITY_HIGH_THRESHOLD = 65
PRIORITY_MEDIUM_THRESHOLD = 35

# ──────────────────────────────────────────────────────────────────────
# Priority scoring weights (must sum to 1.0)
# ──────────────────────────────────────────────────────────────────────
WEIGHT_URGENCY = 0.30
WEIGHT_SEVERITY = 0.25
WEIGHT_POTENTIAL_LOSS = 0.20
WEIGHT_CROSS_AGENT = 0.15
WEIGHT_FEASIBILITY = 0.10

# ──────────────────────────────────────────────────────────────────────
# Required keys in each agent output
# ──────────────────────────────────────────────────────────────────────
FARMSENSE_REQUIRED_KEYS = {
    "irrigation_decision",
    "delay_hours",
    "water_saved_l",
    "reason",
}

CROPGUARD_REQUIRED_KEYS = {
    "crop_health",
    "stress_level",
    "expected_yield_kg",
    "harvest_window",
    "disease_risk",
}

MARKETMIND_REQUIRED_KEYS = {
    "surplus_kg",
    "surplus_level",
    "waste_risk_level",
    "remaining_unallocated_kg",
    "recommended_action",
    "decision_reason",
}
