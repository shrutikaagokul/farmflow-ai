"""
ActionFlow — Test Suite
=========================

Comprehensive tests covering:
    1.  All agents normal → NO_URGENT_ACTION
    2.  Low soil moisture + no rain → irrigation HIGH priority
    3.  High crop stress → crop intervention action
    4.  Expected yield > demand → surplus action
    5.  High waste risk → urgent surplus rescue
    6.  Multiple simultaneous risks → correct prioritisation
    7.  Rainfall expected + irrigation need → conflict handled
    8.  Missing required agent output → validation error
    9.  Invalid input types → validation error
    10. Output is JSON serializable
    11. Source agents correctly identified
    12. Reasons are meaningful and not empty
    13. Cross-agent amplification (low moisture + high stress)
    14. All-agent critical scenario

Run with:
    python -m pytest agents/actionflow/test_actionflow.py -v
"""

import json
import pytest

from agents.actionflow.logic import run_actionflow
from agents.actionflow.models import (
    ACTION_IRRIGATE,
    ACTION_DELAY_IRRIGATION,
    ACTION_MONITOR_CROP_STRESS,
    ACTION_ADDRESS_CROP_STRESS,
    ACTION_PREPARE_FOR_HARVEST,
    ACTION_REDIRECT_SURPLUS,
    ACTION_EXPEDITE_SURPLUS_RESCUE,
    ACTION_MONITOR_DISEASE_RISK,
    ACTION_NO_URGENT_ACTION,
    STATUS_NORMAL,
    STATUS_ATTENTION_REQUIRED,
    STATUS_CRITICAL,
    URGENCY_HIGH,
    URGENCY_MEDIUM,
    URGENCY_LOW,
)


# ──────────────────────────────────────────────────────────────────────
# Test Fixtures — Representative agent outputs
# ──────────────────────────────────────────────────────────────────────

def _farmsense_normal():
    """FarmSense: soil moisture adequate, no irrigation needed."""
    return {
        "irrigation_decision": "NO_ACTION",
        "delay_hours": 0,
        "water_saved_l": 1800,
        "reason": "Soil moisture is adequate (45%). No immediate irrigation needed.",
        "agent": "FARMSENSE",
        "confidence": "HIGH",
        "telemetry_summary": {
            "soil_moisture": 45,
            "rain_probability": 30,
            "temperature": 28,
            "humidity": 60,
            "crop": "Tomato",
            "crop_stage": "Flowering",
        },
    }


def _farmsense_irrigate():
    """FarmSense: low soil moisture, no rain expected → IRRIGATE."""
    return {
        "irrigation_decision": "IRRIGATE",
        "delay_hours": 0,
        "water_saved_l": 0,
        "reason": "Soil moisture is low (20%) and rain probability is low (10%). Irrigation recommended.",
        "agent": "FARMSENSE",
        "confidence": "HIGH",
        "telemetry_summary": {
            "soil_moisture": 20,
            "rain_probability": 10,
            "temperature": 36,
            "humidity": 40,
            "crop": "Tomato",
            "crop_stage": "Flowering",
        },
    }


def _farmsense_delay():
    """FarmSense: low soil moisture but rain expected → DELAY."""
    return {
        "irrigation_decision": "DELAY",
        "delay_hours": 4,
        "water_saved_l": 1800,
        "reason": "High rain probability detected (78%). Delaying irrigation by ~4h to conserve water.",
        "agent": "FARMSENSE",
        "confidence": "MEDIUM",
        "telemetry_summary": {
            "soil_moisture": 27,
            "rain_probability": 78,
            "temperature": 34,
            "humidity": 61,
            "crop": "Tomato",
            "crop_stage": "Flowering",
        },
    }


def _cropguard_healthy():
    """CropGuard: healthy crop, low stress."""
    return {
        "crop_health": 88,
        "stress_level": "LOW",
        "expected_yield_kg": 1500.0,
        "harvest_window": "5–7 days",
        "disease_risk": "LOW",
    }


def _cropguard_moderate_stress():
    """CropGuard: moderate stress, moderate health."""
    return {
        "crop_health": 75,
        "stress_level": "MODERATE",
        "expected_yield_kg": 1420.0,
        "harvest_window": "5–7 days",
        "disease_risk": "LOW",
    }


def _cropguard_high_stress():
    """CropGuard: high stress, poor health."""
    return {
        "crop_health": 45,
        "stress_level": "HIGH",
        "expected_yield_kg": 900.0,
        "harvest_window": "5–7 days",
        "disease_risk": "MODERATE",
    }


def _cropguard_high_disease():
    """CropGuard: high disease risk."""
    return {
        "crop_health": 70,
        "stress_level": "MODERATE",
        "expected_yield_kg": 1200.0,
        "harvest_window": "10–20 days",
        "disease_risk": "HIGH",
    }


def _marketmind_balanced():
    """MarketMind: balanced market, no surplus."""
    return {
        "surplus_kg": 0,
        "food_rescued_kg": 0,
        "waste_avoided_kg": 0,
        "remaining_unallocated_kg": 0,
        "allocations": [{"destination": "Market A", "quantity_kg": 1000}],
        "surplus_percentage": 0.0,
        "surplus_level": "BALANCED",
        "waste_risk_percentage": 0.0,
        "waste_risk_level": "NONE",
        "price_per_kg": 40.0,
        "economic_value_recovered_inr": 0,
        "recommended_action": "NORMAL_MARKET_ALLOCATION",
        "decision_reason": "Harvest matches commercial demand.",
    }


def _marketmind_low_surplus():
    """MarketMind: low surplus, all rescued."""
    return {
        "surplus_kg": 90,
        "food_rescued_kg": 90,
        "waste_avoided_kg": 90,
        "remaining_unallocated_kg": 0,
        "allocations": [
            {"destination": "Market A", "quantity_kg": 950},
            {"destination": "Food Rescue", "quantity_kg": 90},
        ],
        "surplus_percentage": 8.65,
        "surplus_level": "LOW_SURPLUS",
        "waste_risk_percentage": 0.0,
        "waste_risk_level": "NONE",
        "price_per_kg": 40.0,
        "economic_value_recovered_inr": 3600.0,
        "recommended_action": "ROUTE_SURPLUS_TO_FOOD_RESCUE",
        "decision_reason": "90 kg surplus redirected through rescue channels.",
    }


def _marketmind_high_waste_risk():
    """MarketMind: critical surplus with high waste risk."""
    return {
        "surplus_kg": 500,
        "food_rescued_kg": 200,
        "waste_avoided_kg": 200,
        "remaining_unallocated_kg": 300,
        "allocations": [
            {"destination": "Market A", "quantity_kg": 1000},
            {"destination": "Food Rescue", "quantity_kg": 200},
        ],
        "surplus_percentage": 33.3,
        "surplus_level": "CRITICAL_SURPLUS",
        "waste_risk_percentage": 20.0,
        "waste_risk_level": "HIGH",
        "price_per_kg": 40.0,
        "economic_value_recovered_inr": 8000.0,
        "recommended_action": "URGENT_SURPLUS_RESCUE",
        "decision_reason": "300 kg remains unallocated. High waste risk.",
    }


def _marketmind_moderate_surplus():
    """MarketMind: moderate surplus, partially rescued."""
    return {
        "surplus_kg": 250,
        "food_rescued_kg": 200,
        "waste_avoided_kg": 200,
        "remaining_unallocated_kg": 50,
        "allocations": [
            {"destination": "Market A", "quantity_kg": 1000},
            {"destination": "Food Rescue", "quantity_kg": 200},
        ],
        "surplus_percentage": 20.0,
        "surplus_level": "MODERATE_SURPLUS",
        "waste_risk_percentage": 4.0,
        "waste_risk_level": "LOW",
        "price_per_kg": 40.0,
        "economic_value_recovered_inr": 8000.0,
        "recommended_action": "ROUTE_REMAINING_SURPLUS_TO_ADDITIONAL_RESCUE",
        "decision_reason": "50 kg remains unallocated after rescue.",
    }


# ==================================================================
# TEST 1: All agents indicate normal conditions
# ==================================================================

def test_all_normal_no_urgent_action():
    """When all agents report normal, ActionFlow should produce NO_URGENT_ACTION."""
    result = run_actionflow(
        _farmsense_normal(),
        _cropguard_healthy(),
        _marketmind_balanced(),
    )
    assert result["agent"] == "ACTIONFLOW"
    assert result["overall_status"] == STATUS_NORMAL

    actions = result["priority_actions"]
    assert len(actions) >= 1
    # The top action should be no urgent action or harvest prep (since 5-7 days is imminent)
    action_types = [a["action"] for a in actions]
    assert ACTION_NO_URGENT_ACTION in action_types or ACTION_PREPARE_FOR_HARVEST in action_types


# ==================================================================
# TEST 2: Low soil moisture + no rain → irrigation HIGH priority
# ==================================================================

def test_irrigation_needed_high_priority():
    """Low soil moisture + no rain expected → IRRIGATE as high priority."""
    result = run_actionflow(
        _farmsense_irrigate(),
        _cropguard_healthy(),
        _marketmind_balanced(),
    )
    actions = result["priority_actions"]
    irrigate_actions = [a for a in actions if a["action"] == ACTION_IRRIGATE]
    assert len(irrigate_actions) == 1
    assert irrigate_actions[0]["urgency"] == URGENCY_HIGH
    assert "FARMSENSE" in irrigate_actions[0]["source_agents"]


# ==================================================================
# TEST 3: High crop stress → crop intervention action
# ==================================================================

def test_high_crop_stress_generates_action():
    """High crop stress should generate ADDRESS_CROP_STRESS action."""
    result = run_actionflow(
        _farmsense_normal(),
        _cropguard_high_stress(),
        _marketmind_balanced(),
    )
    actions = result["priority_actions"]
    stress_actions = [a for a in actions if a["action"] == ACTION_ADDRESS_CROP_STRESS]
    assert len(stress_actions) == 1
    assert "CROPGUARD" in stress_actions[0]["source_agents"]
    assert stress_actions[0]["urgency"] in (URGENCY_HIGH, URGENCY_MEDIUM)


# ==================================================================
# TEST 4: Expected yield > demand → surplus action
# ==================================================================

def test_surplus_generates_redirect_action():
    """Surplus detected should generate a REDIRECT_SURPLUS action."""
    result = run_actionflow(
        _farmsense_normal(),
        _cropguard_healthy(),
        _marketmind_low_surplus(),
    )
    actions = result["priority_actions"]
    surplus_actions = [
        a for a in actions
        if a["action"] in (ACTION_REDIRECT_SURPLUS, ACTION_EXPEDITE_SURPLUS_RESCUE)
    ]
    assert len(surplus_actions) == 1
    assert "MARKETMIND" in surplus_actions[0]["source_agents"]


# ==================================================================
# TEST 5: High waste risk → urgent surplus rescue
# ==================================================================

def test_high_waste_risk_urgent_rescue():
    """High waste risk should generate EXPEDITE_SURPLUS_RESCUE as HIGH urgency."""
    result = run_actionflow(
        _farmsense_normal(),
        _cropguard_healthy(),
        _marketmind_high_waste_risk(),
    )
    actions = result["priority_actions"]
    rescue_actions = [a for a in actions if a["action"] == ACTION_EXPEDITE_SURPLUS_RESCUE]
    assert len(rescue_actions) == 1
    assert rescue_actions[0]["urgency"] == URGENCY_HIGH
    assert "MARKETMIND" in rescue_actions[0]["source_agents"]


# ==================================================================
# TEST 6: Multiple simultaneous risks → correct prioritisation
# ==================================================================

def test_multiple_risks_prioritised():
    """Multiple risks present should all generate actions in priority order."""
    result = run_actionflow(
        _farmsense_irrigate(),
        _cropguard_high_stress(),
        _marketmind_high_waste_risk(),
    )
    actions = result["priority_actions"]

    # Should have at least 3 actions (irrigation, crop stress, surplus)
    assert len(actions) >= 3

    # All should have valid priority numbers
    priorities = [a["priority"] for a in actions]
    assert priorities == sorted(priorities)  # ascending order

    # Priority scores should be descending
    scores = [a["priority_score"] for a in actions]
    assert scores == sorted(scores, reverse=True)

    # Overall status should be CRITICAL
    assert result["overall_status"] == STATUS_CRITICAL


# ==================================================================
# TEST 7: Rainfall expected + irrigation need → conflict handled
# ==================================================================

def test_delay_vs_stress_conflict():
    """
    FarmSense says DELAY (rain expected) + CropGuard says MODERATE stress.
    ActionFlow should delay irrigation but acknowledge the stress.
    """
    result = run_actionflow(
        _farmsense_delay(),
        _cropguard_moderate_stress(),
        _marketmind_balanced(),
    )
    actions = result["priority_actions"]

    delay_actions = [a for a in actions if a["action"] == ACTION_DELAY_IRRIGATION]
    assert len(delay_actions) == 1

    delay_action = delay_actions[0]
    # Should reference both FarmSense and CropGuard (conflict awareness)
    assert "FARMSENSE" in delay_action["source_agents"]
    assert "CROPGUARD" in delay_action["source_agents"]
    # Reason should mention the stress
    assert "stress" in delay_action["reason"].lower() or "monitor" in delay_action["reason"].lower()


def test_delay_vs_high_stress_conflict():
    """
    FarmSense says DELAY + CropGuard says HIGH stress.
    ActionFlow should still delay but flag urgency and mention monitoring.
    """
    result = run_actionflow(
        _farmsense_delay(),
        _cropguard_high_stress(),
        _marketmind_balanced(),
    )
    actions = result["priority_actions"]

    delay_actions = [a for a in actions if a["action"] == ACTION_DELAY_IRRIGATION]
    assert len(delay_actions) == 1

    delay_action = delay_actions[0]
    assert "FARMSENSE" in delay_action["source_agents"]
    assert "CROPGUARD" in delay_action["source_agents"]


# ==================================================================
# TEST 8: Missing required agent output → validation error
# ==================================================================

def test_missing_farmsense_output():
    """Missing FarmSense required keys should raise ValueError."""
    with pytest.raises(ValueError, match="FarmSense"):
        run_actionflow(
            {"irrigation_decision": "IRRIGATE"},  # Missing delay_hours, water_saved_l, reason
            _cropguard_healthy(),
            _marketmind_balanced(),
        )


def test_missing_cropguard_output():
    """Missing CropGuard required keys should raise ValueError."""
    with pytest.raises(ValueError, match="CropGuard"):
        run_actionflow(
            _farmsense_normal(),
            {"crop_health": 80},  # Missing stress_level, etc.
            _marketmind_balanced(),
        )


def test_missing_marketmind_output():
    """Missing MarketMind required keys should raise ValueError."""
    with pytest.raises(ValueError, match="MarketMind"):
        run_actionflow(
            _farmsense_normal(),
            _cropguard_healthy(),
            {"surplus_kg": 100},  # Missing surplus_level, etc.
        )


# ==================================================================
# TEST 9: Invalid input types → validation error
# ==================================================================

def test_invalid_input_not_dict():
    """Non-dict inputs should raise ValueError."""
    with pytest.raises(ValueError):
        run_actionflow("not a dict", _cropguard_healthy(), _marketmind_balanced())

    with pytest.raises(ValueError):
        run_actionflow(_farmsense_normal(), 42, _marketmind_balanced())

    with pytest.raises(ValueError):
        run_actionflow(_farmsense_normal(), _cropguard_healthy(), [1, 2, 3])


# ==================================================================
# TEST 10: Output is JSON serializable
# ==================================================================

def test_output_is_json_serializable():
    """The entire ActionFlow output must be JSON serializable."""
    result = run_actionflow(
        _farmsense_delay(),
        _cropguard_moderate_stress(),
        _marketmind_low_surplus(),
    )
    # This will raise TypeError if not serializable
    serialized = json.dumps(result)
    assert isinstance(serialized, str)

    # Roundtrip check
    parsed = json.loads(serialized)
    assert parsed["agent"] == "ACTIONFLOW"
    assert isinstance(parsed["priority_actions"], list)


# ==================================================================
# TEST 11: Source agents correctly identified
# ==================================================================

def test_source_agents_correctness():
    """Each action should list the correct source agents."""
    result = run_actionflow(
        _farmsense_irrigate(),
        _cropguard_healthy(),
        _marketmind_low_surplus(),
    )
    for action in result["priority_actions"]:
        assert isinstance(action["source_agents"], list)
        assert len(action["source_agents"]) >= 1
        for agent in action["source_agents"]:
            assert agent in ("FARMSENSE", "CROPGUARD", "MARKETMIND")


# ==================================================================
# TEST 12: Reasons are meaningful and not empty
# ==================================================================

def test_reasons_are_meaningful():
    """Every action should have a non-empty, substantive reason."""
    result = run_actionflow(
        _farmsense_delay(),
        _cropguard_moderate_stress(),
        _marketmind_moderate_surplus(),
    )
    for action in result["priority_actions"]:
        assert isinstance(action["reason"], str)
        assert len(action["reason"]) > 20  # Not a trivial string
        assert action["reason"] != ""
        # Should not be generic
        assert action["reason"].lower() != "monitor conditions."


# ==================================================================
# TEST 13: Cross-agent amplification (irrigate + high stress)
# ==================================================================

def test_cross_agent_amplification():
    """
    When FarmSense says IRRIGATE and CropGuard says HIGH stress,
    the irrigation action should reference both agents and have
    elevated priority.
    """
    result = run_actionflow(
        _farmsense_irrigate(),
        _cropguard_high_stress(),
        _marketmind_balanced(),
    )
    actions = result["priority_actions"]
    irrigate_actions = [a for a in actions if a["action"] == ACTION_IRRIGATE]
    assert len(irrigate_actions) == 1

    irrigate = irrigate_actions[0]
    assert "FARMSENSE" in irrigate["source_agents"]
    assert "CROPGUARD" in irrigate["source_agents"]
    assert irrigate["urgency"] == URGENCY_HIGH

    # Should have a higher priority score than irrigation without stress
    result_no_stress = run_actionflow(
        _farmsense_irrigate(),
        _cropguard_healthy(),
        _marketmind_balanced(),
    )
    irrigate_no_stress = [
        a for a in result_no_stress["priority_actions"]
        if a["action"] == ACTION_IRRIGATE
    ][0]
    assert irrigate["priority_score"] > irrigate_no_stress["priority_score"]


# ==================================================================
# TEST 14: All-agent critical scenario
# ==================================================================

def test_all_critical_scenario():
    """
    Worst case: irrigation needed + high stress + high waste risk.
    Should produce CRITICAL status with multiple HIGH-priority actions.
    """
    result = run_actionflow(
        _farmsense_irrigate(),
        _cropguard_high_stress(),
        _marketmind_high_waste_risk(),
    )
    assert result["overall_status"] == STATUS_CRITICAL

    high_actions = [a for a in result["priority_actions"] if a["urgency"] == URGENCY_HIGH]
    assert len(high_actions) >= 2  # At least irrigation + surplus rescue

    # Overall reason should mention priority actions
    assert len(result["overall_reason"]) > 10

    # Risk summary should reflect critical state
    risk = result["risk_summary"]
    assert risk["irrigation_status"] == "IRRIGATE"
    assert risk["crop_stress"] == "HIGH"
    assert risk["waste_risk"] == "HIGH"


# ==================================================================
# TEST 15: Disease risk generates action
# ==================================================================

def test_disease_risk_generates_action():
    """High disease risk should generate MONITOR_DISEASE_RISK action."""
    result = run_actionflow(
        _farmsense_normal(),
        _cropguard_high_disease(),
        _marketmind_balanced(),
    )
    actions = result["priority_actions"]
    disease_actions = [a for a in actions if a["action"] == ACTION_MONITOR_DISEASE_RISK]
    assert len(disease_actions) == 1
    assert "CROPGUARD" in disease_actions[0]["source_agents"]


# ==================================================================
# TEST 16: Output structure completeness
# ==================================================================

def test_output_structure():
    """Verify all required top-level keys are present in the output."""
    result = run_actionflow(
        _farmsense_normal(),
        _cropguard_healthy(),
        _marketmind_balanced(),
    )
    assert "agent" in result
    assert "overall_status" in result
    assert "priority_actions" in result
    assert "overall_reason" in result
    assert "risk_summary" in result

    assert result["agent"] == "ACTIONFLOW"
    assert result["overall_status"] in (STATUS_NORMAL, STATUS_ATTENTION_REQUIRED, STATUS_CRITICAL)
    assert isinstance(result["priority_actions"], list)
    assert isinstance(result["overall_reason"], str)
    assert isinstance(result["risk_summary"], dict)

    # Each action should have required keys
    for action in result["priority_actions"]:
        assert "priority" in action
        assert "action" in action
        assert "urgency" in action
        assert "title" in action
        assert "impact" in action
        assert "reason" in action
        assert "source_agents" in action


# ==================================================================
# TEST 17: Moderate surplus with yield context
# ==================================================================

def test_moderate_surplus_with_yield_context():
    """Moderate surplus should reference CropGuard yield in its reason."""
    result = run_actionflow(
        _farmsense_normal(),
        _cropguard_healthy(),
        _marketmind_moderate_surplus(),
    )
    actions = result["priority_actions"]
    surplus_actions = [a for a in actions if a["action"] == ACTION_REDIRECT_SURPLUS]
    assert len(surplus_actions) == 1

    surplus = surplus_actions[0]
    assert "CROPGUARD" in surplus["source_agents"]
    assert "MARKETMIND" in surplus["source_agents"]


# ==================================================================
# TEST 18: Zero yield suppresses harvest preparation
# ==================================================================
def test_zero_yield_suppresses_harvest_preparation():
    """When expected yield is 0 (e.g. crop failure), do not output PREPARE_FOR_HARVEST."""
    cropguard_zero = {
        "crop_health": 0,
        "stress_level": "HIGH",
        "expected_yield_kg": 0.0,
        "harvest_window": "5–7 days",
        "disease_risk": "LOW",
    }
    result = run_actionflow(
        _farmsense_irrigate(),
        cropguard_zero,
        _marketmind_balanced(),
    )
    action_types = [a["action"] for a in result["priority_actions"]]
    assert ACTION_PREPARE_FOR_HARVEST not in action_types


# ==================================================================
# TEST 19: Full 4-Agent Pipeline Integration
# ==================================================================
def test_full_four_agent_pipeline_integration():
    """Verify live integration of FarmSense -> CropGuard -> MarketMind -> ActionFlow."""
    from agents.farmsense.agent import analyze as farmsense_analyze
    from agents.cropguard.predictor import predict as cropguard_predict
    from agents.cropguard.model import FarmInput, FarmSenseInput
    from agents.marketmind.marketmind import run_marketmind

    telemetry = {
        "temperature": 32,
        "humidity": 45,
        "soil_moisture": 18,
        "rain_probability": 12,
        "wind_speed": 10,
        "crop": "Tomato",
        "crop_stage": "Flowering",
    }

    # Step 1: FarmSense
    fs_res = farmsense_analyze(telemetry)
    fs_dict = fs_res.model_dump()
    assert fs_dict["irrigation_decision"] == "IRRIGATE"

    # Step 2: CropGuard
    cg_res = cropguard_predict(
        farm=FarmInput(**telemetry),
        farmsense=FarmSenseInput(
            irrigation_decision=fs_res.irrigation_decision,
            delay_hours=fs_res.delay_hours,
            water_saved_l=fs_res.water_saved_l,
            reason=fs_res.reason,
        )
    )
    cg_dict = cg_res.model_dump()
    assert cg_dict["expected_yield_kg"] > 0

    # Step 3: MarketMind
    mm_dict = run_marketmind({
        "expected_yield_kg": cg_dict["expected_yield_kg"],
        "crop": "Tomato",
        "destinations": {"market_a": 950, "food_rescue": 200}
    })
    assert "surplus_kg" in mm_dict

    # Step 4: ActionFlow
    af_res = run_actionflow(fs_dict, cg_dict, mm_dict)
    assert af_res["agent"] == "ACTIONFLOW"
    assert len(af_res["priority_actions"]) >= 1
    action_types = [a["action"] for a in af_res["priority_actions"]]
    assert "IRRIGATE" in action_types


# ==================================================================
# TEST 20: Dynamic Market Demand Shifts ActionFlow Decisions
# ==================================================================
def test_dynamic_market_demand_shifts_actionflow_decisions():
    """Verify that lowering vs raising market demand shifts ActionFlow surplus actions."""
    from agents.marketmind.marketmind import run_marketmind
    cropguard_res = {
        "crop_health": 95,
        "stress_level": "LOW",
        "expected_yield_kg": 1000.0,
        "harvest_window": "5–7 days",
        "disease_risk": "LOW",
    }
    farmsense_res = {
        "irrigation_decision": "NO_ACTION",
        "delay_hours": 0,
        "water_saved_l": 1500,
        "reason": "Adequate soil moisture",
        "agent": "FARMSENSE",
        "confidence": "HIGH",
    }

    # Case A: Low market demand (500 kg vs 1000 kg yield -> 500 kg surplus)
    mm_low_demand = run_marketmind({
        "expected_yield_kg": cropguard_res["expected_yield_kg"],
        "market_demand": 500,
        "crop": "Tomato",
        "destinations": {"food_rescue": 100}
    })
    af_low = run_actionflow(farmsense_res, cropguard_res, mm_low_demand)
    low_action_types = [a["action"] for a in af_low["priority_actions"]]
    assert any(a in low_action_types for a in ["EXPEDITE_SURPLUS_RESCUE", "REDIRECT_SURPLUS", "PREPARE_FOR_HARVEST"])
    assert af_low["risk_summary"]["surplus_status"] in ["CRITICAL_SURPLUS", "MODERATE_SURPLUS", "HIGH_SURPLUS"]

    # Case B: High market demand (1500 kg vs 1000 kg yield -> 0 kg surplus)
    mm_high_demand = run_marketmind({
        "expected_yield_kg": cropguard_res["expected_yield_kg"],
        "market_demand": 1500,
        "crop": "Tomato",
    })
    af_high = run_actionflow(farmsense_res, cropguard_res, mm_high_demand)
    assert af_high["risk_summary"]["surplus_status"] == "BALANCED"
    assert af_high["risk_summary"]["waste_risk"] in ("NONE", "LOW")
    high_action_types = [a["action"] for a in af_high["priority_actions"]]
    assert "EXPEDITE_SURPLUS_RESCUE" not in high_action_types
