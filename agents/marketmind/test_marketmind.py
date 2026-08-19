import sys
import os
import pytest

# Ensure the agent directory is in path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from marketmind import run_marketmind

# ==================================================================
# PRESERVED EXISTING TEST CASES (SCENARIOS A to E & Edge Cases)
# ==================================================================

def test_scenario_a_balanced_market():
    """Test A: Normal balanced market where harvest equals demand exactly."""
    input_data = {
        "expected_yield_kg": 1000,
        "destinations": {
            "market_a": 600,
            "market_b": 400
        }
    }
    result = run_marketmind(input_data)
    assert result["surplus_kg"] == 0
    assert result["food_rescued_kg"] == 0
    assert result["waste_avoided_kg"] == 0
    assert result["remaining_unallocated_kg"] == 0
    
    total_allocated = sum(item["quantity_kg"] for item in result["allocations"])
    assert total_allocated == 1000


def test_scenario_b_surplus_with_rescue():
    """Test B: Surplus with rescue capacity."""
    input_data = {
        "expected_yield_kg": 1420,
        "destinations": {
            "market_a": 600,
            "market_b": 350,
            "restaurants": 180,
            "food_rescue": 200,
            "ngo": 100
        }
    }
    result = run_marketmind(input_data)
    
    assert result["surplus_kg"] == 290
    assert result["food_rescued_kg"] == 290
    assert result["waste_avoided_kg"] == 290
    assert result["remaining_unallocated_kg"] == 0
    
    allocations_dict = {item["destination"]: item["quantity_kg"] for item in result["allocations"]}
    assert allocations_dict["Market A"] == 600
    assert allocations_dict["Market B"] == 350
    assert allocations_dict["Restaurants"] == 180
    assert allocations_dict["Food Rescue"] == 200
    assert allocations_dict["NGO"] == 90


def test_scenario_c_large_surplus():
    """Test C: Large surplus exceeding alternative capacity."""
    input_data = {
        "expected_yield_kg": 2000,
        "destinations": {
            "market_a": 500,
            "food_rescue": 200,
            "ngo": 100
        }
    }
    result = run_marketmind(input_data)
    assert result["surplus_kg"] == 1500
    assert result["food_rescued_kg"] == 300
    assert result["waste_avoided_kg"] == 300
    assert result["remaining_unallocated_kg"] == 1200
    
    allocations_dict = {item["destination"]: item["quantity_kg"] for item in result["allocations"]}
    assert allocations_dict["Market A"] == 500
    assert allocations_dict["Food Rescue"] == 200
    assert allocations_dict["NGO"] == 100


def test_scenario_d_low_harvest():
    """Test D: Low harvest below total commercial demand."""
    input_data = {
        "expected_yield_kg": 500,
        "destinations": {
            "market_a": 600,
            "market_b": 350,
            "food_rescue": 200
        }
    }
    result = run_marketmind(input_data)
    assert result["surplus_kg"] == 0
    assert result["food_rescued_kg"] == 0
    assert result["waste_avoided_kg"] == 0
    assert result["remaining_unallocated_kg"] == 0
    
    total_allocated = sum(item["quantity_kg"] for item in result["allocations"])
    assert total_allocated == 500
    
    allocations_dict = {item["destination"]: item["quantity_kg"] for item in result["allocations"]}
    assert allocations_dict.get("Market A") == 500
    assert "Market B" not in allocations_dict
    assert "Food Rescue" not in allocations_dict


def test_scenario_e_market_demand_change():
    """Test E: Dynamic demand recalculation simulation."""
    initial_input = {
        "expected_yield_kg": 1420,
        "destinations": {
            "market_a": 600,
            "market_b": 350,
            "restaurants": 180,
            "food_rescue": 200,
            "ngo": 100
        }
    }
    res1 = run_marketmind(initial_input)
    assert res1["surplus_kg"] == 290
    
    changed_input = {
        "expected_yield_kg": 1420,
        "destinations": {
            "market_a": 350,
            "market_b": 350,
            "restaurants": 180,
            "food_rescue": 200,
            "ngo": 100,
            "community_kitchens": 300
        }
    }
    res2 = run_marketmind(changed_input)
    
    assert res2["surplus_kg"] == 540
    assert res2["food_rescued_kg"] == 540
    assert res2["waste_avoided_kg"] == 540
    assert res2["remaining_unallocated_kg"] == 0
    
    allocations_dict = {item["destination"]: item["quantity_kg"] for item in res2["allocations"]}
    assert allocations_dict["Market A"] == 350
    assert allocations_dict["Food Rescue"] == 200
    assert allocations_dict["NGO"] == 100
    assert allocations_dict["Community Kitchens"] == 240


def test_legacy_edge_cases():
    """Verify legacy edge cases validation logic."""
    input_zero = {
        "expected_yield_kg": 100,
        "destinations": {
            "market_a": 0,
            "food_rescue": 100
        }
    }
    res = run_marketmind(input_zero)
    assert res["surplus_kg"] == 100
    assert res["food_rescued_kg"] == 100
    assert res["allocations"] == [{"destination": "Food Rescue", "quantity_kg": 100}]
    
    input_empty = {
        "expected_yield_kg": 500,
        "destinations": {}
    }
    res_empty = run_marketmind(input_empty)
    assert res_empty["surplus_kg"] == 500
    assert res_empty["food_rescued_kg"] == 0
    assert res_empty["remaining_unallocated_kg"] == 500
    assert res_empty["allocations"] == []
    
    with pytest.raises(ValueError):
        run_marketmind({"expected_yield_kg": -10, "destinations": {}})

    with pytest.raises(ValueError):
        run_marketmind({"expected_yield_kg": "large", "destinations": {}})

    with pytest.raises(ValueError):
        run_marketmind({"expected_yield_kg": 100, "destinations": {"market_a": -5}})


# ==================================================================
# NEW TEST CASES (As requested in the user prompt)
# ==================================================================

# 1. Balanced harvest
def test_new_balanced_harvest():
    """Test 1: Surplus level is BALANCED when surplus is 0%."""
    res = run_marketmind({
        "expected_yield_kg": 1000,
        "destinations": {"market_a": 1000}
    })
    assert res["surplus_percentage"] == 0.0
    assert res["surplus_level"] == "BALANCED"


# 2. Low surplus
def test_new_low_surplus():
    """Test 2: Surplus level is LOW_SURPLUS when surplus is up to 15%."""
    res = run_marketmind({
        "expected_yield_kg": 1100,  # 100 kg (9.09%) surplus
        "destinations": {"market_a": 1000}
    })
    assert 0.0 < res["surplus_percentage"] <= 15.0
    assert res["surplus_level"] == "LOW_SURPLUS"


# 3. Moderate surplus
def test_new_moderate_surplus():
    """Test 3: Surplus level is MODERATE_SURPLUS when surplus is between 15% and 30%."""
    res = run_marketmind({
        "expected_yield_kg": 1250,  # 250 kg (20.0%) surplus
        "destinations": {"market_a": 1000}
    })
    assert 15.0 < res["surplus_percentage"] <= 30.0
    assert res["surplus_level"] == "MODERATE_SURPLUS"


# 4. Critical surplus
def test_new_critical_surplus():
    """Test 4: Surplus level is CRITICAL_SURPLUS when surplus is greater than 30%."""
    res = run_marketmind({
        "expected_yield_kg": 1500,  # 500 kg (33.33%) surplus
        "destinations": {"market_a": 1000}
    })
    assert res["surplus_percentage"] > 30.0
    assert res["surplus_level"] == "CRITICAL_SURPLUS"


# 5. Zero harvest
def test_new_zero_harvest():
    """Test 5: Zero harvest handled safely."""
    res = run_marketmind({
        "expected_yield_kg": 0,
        "destinations": {"market_a": 100, "food_rescue": 50}
    })
    assert res["surplus_percentage"] == 0.0
    assert res["surplus_level"] == "BALANCED"
    assert res["waste_risk_percentage"] == 0.0
    assert res["waste_risk_level"] == "NONE"
    assert res["recommended_action"] == "NO_HARVEST_AVAILABLE"
    assert res["decision_reason"] == "No harvest available for allocation."


# 6. Zero unallocated waste risk
def test_new_zero_unallocated_waste_risk():
    """Test 6: Waste risk is NONE when all surplus is allocated."""
    res = run_marketmind({
        "expected_yield_kg": 1200,
        "destinations": {
            "market_a": 1000,
            "food_rescue": 200
        }
    })
    assert res["remaining_unallocated_kg"] == 0
    assert res["waste_risk_percentage"] == 0.0
    assert res["waste_risk_level"] == "NONE"


# 7. High waste risk
def test_new_high_waste_risk():
    """Test 7: Waste risk level is HIGH when unallocated is > 25%."""
    res = run_marketmind({
        "expected_yield_kg": 1500,  # 500 kg unallocated (33.33%)
        "destinations": {"market_a": 1000}
    })
    assert res["waste_risk_percentage"] > 25.0
    assert res["waste_risk_level"] == "HIGH"


# 8. Economic value calculation
def test_new_economic_value_calculation():
    """Test 8: Value calculated as food_rescued_kg * price_per_kg."""
    res = run_marketmind({
        "expected_yield_kg": 1200,
        "destinations": {
            "market_a": 1000,
            "food_rescue": 200
        },
        "price_per_kg": 40.0
    })
    assert res["food_rescued_kg"] == 200
    assert res["price_per_kg"] == 40.0
    assert res["economic_value_recovered_inr"] == 8000.0


# 9. Default crop price
def test_new_default_crop_price():
    """Test 9: Uses mapping defaults for price calculation when crop is provided but not price."""
    # Potato default is 30
    res_potato = run_marketmind({
        "expected_yield_kg": 1200,
        "crop": "Potato",
        "destinations": {"market_a": 1000, "food_rescue": 200}
    })
    assert res_potato["price_per_kg"] == 30.0
    assert res_potato["economic_value_recovered_inr"] == 6000.0

    # Unknown crop defaults to 30
    res_unknown = run_marketmind({
        "expected_yield_kg": 1200,
        "crop": "DragonFruit",
        "destinations": {"market_a": 1000, "food_rescue": 200}
    })
    assert res_unknown["price_per_kg"] == 30.0


# 10. Explicit price_per_kg
def test_new_explicit_price_per_kg():
    """Test 10: Explicit price overrides default mapping."""
    res = run_marketmind({
        "expected_yield_kg": 1200,
        "crop": "Tomato",  # Default is 40
        "price_per_kg": 50.0, # Explicit overrides
        "destinations": {"market_a": 1000, "food_rescue": 200}
    })
    assert res["price_per_kg"] == 50.0
    assert res["economic_value_recovered_inr"] == 10000.0


# 11. Recommended action when all surplus is rescued
def test_new_recommended_action_all_rescued():
    """Test 11: Action is ROUTE_SURPLUS_TO_FOOD_RESCUE when all surplus is rescued."""
    res = run_marketmind({
        "expected_yield_kg": 1200,
        "destinations": {
            "market_a": 1000,
            "food_rescue": 200
        }
    })
    assert res["recommended_action"] == "ROUTE_SURPLUS_TO_FOOD_RESCUE"
    assert "preventing estimated food waste" in res["decision_reason"]


# 12. Recommended action when some surplus remains unallocated
def test_new_recommended_action_some_unallocated():
    """Test 12: Actions and reasons for partial surplus rescue or high waste risk."""
    # Scenario 1: Partial rescue with non-high risk (e.g. 10% risk -> MODERATE)
    # expected_yield = 1150, normal demand = 1000, rescue capacity = 100, unallocated = 50.
    # surplus = 150. unallocated percentage = 50 / 1150 = 4.3% -> LOW waste risk.
    res_partial = run_marketmind({
        "expected_yield_kg": 1150,
        "destinations": {
            "market_a": 1000,
            "food_rescue": 100
        }
    })
    assert res_partial["recommended_action"] == "ROUTE_REMAINING_SURPLUS_TO_ADDITIONAL_RESCUE"
    assert "remains unallocated after all available destinations are filled" in res_partial["decision_reason"]

    # Scenario 2: High waste risk (> 25%)
    # expected_yield = 1500, normal demand = 1000, rescue capacity = 100, unallocated = 400.
    # surplus = 500. unallocated percentage = 400 / 1500 = 26.6% -> HIGH waste risk.
    res_high_risk = run_marketmind({
        "expected_yield_kg": 1500,
        "destinations": {
            "market_a": 1000,
            "food_rescue": 100
        }
    })
    assert res_high_risk["waste_risk_level"] == "HIGH"
    assert res_high_risk["recommended_action"] == "URGENT_SURPLUS_RESCUE"
    assert "remains unallocated after all available destinations are filled" in res_high_risk["decision_reason"]


# ==================================================================
# NEW VALIDATION TESTS
# ==================================================================
def test_new_validations():
    """Test validation of crop and price_per_kg fields."""
    # invalid crop type
    with pytest.raises(ValueError):
        run_marketmind({"expected_yield_kg": 100, "crop": True})

    # invalid price type
    with pytest.raises(ValueError):
        run_marketmind({"expected_yield_kg": 100, "price_per_kg": "free"})

    # negative price
    with pytest.raises(ValueError):
        run_marketmind({"expected_yield_kg": 100, "price_per_kg": -1.5})


# ==================================================================
# NEW TESTS: EXPANDED CROPS & VALUE AT RISK
# ==================================================================
def test_expanded_crop_prices_and_value_at_risk():
    """Verify newly supported crops like chili and cotton get correct pricing and calculate value at risk."""
    res_chili = run_marketmind({
        "expected_yield_kg": 500,
        "crop": "Chili",
        "destinations": {"market_a": 300}
    })
    assert res_chili["price_per_kg"] == 80.0
    assert res_chili["surplus_kg"] == 200
    assert res_chili["remaining_unallocated_kg"] == 200
    assert res_chili["economic_value_at_risk_inr"] == 200 * 80.0

def test_zero_destinations_all_at_risk():
    """When no destinations are configured, 100% of yield is surplus and at risk."""
    res = run_marketmind({
        "expected_yield_kg": 1000,
        "crop": "Tomato",
        "destinations": {}
    })
    assert res["surplus_kg"] == 1000
    assert res["remaining_unallocated_kg"] == 1000
    assert res["waste_risk_level"] == "HIGH"
    assert res["economic_value_at_risk_inr"] == 1000 * 40.0
    assert "No commercial destinations configured" in res["decision_reason"]


# ==================================================================
# NEW TESTS: EXPLICIT MARKET DEMAND INPUT
# ==================================================================
def test_explicit_market_demand_creates_surplus():
    """When expected_yield = 800 and market_demand = 500, surplus should be 300 kg."""
    res = run_marketmind({
        "expected_yield_kg": 800,
        "market_demand": 500,
        "crop": "Tomato",
    })
    assert res["surplus_kg"] == 300.0
    assert res["market_demand_kg"] == 500.0
    assert res["surplus_percentage"] == round((300.0 / 800.0) * 100, 2)
    assert res["remaining_unallocated_kg"] == 300.0
    assert res["economic_value_at_risk_inr"] == 300.0 * 40.0

def test_explicit_market_demand_exceeds_yield_no_surplus():
    """When expected_yield = 800 and market_demand = 1200, surplus should be 0 kg."""
    res = run_marketmind({
        "expected_yield_kg": 800,
        "market_demand": 1200,
        "crop": "Tomato",
    })
    assert res["surplus_kg"] == 0.0
    assert res["surplus_level"] == "BALANCED"
    assert res["waste_risk_level"] in ("NONE", "LOW")
    assert res["remaining_unallocated_kg"] == 0.0
    assert res["recommended_action"] == "NORMAL_MARKET_ALLOCATION"
