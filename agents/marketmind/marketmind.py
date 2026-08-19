"""
MarketMind Agent
Matches predicted harvest with destination demand/capacity, detects surplus,
routes surplus to alternative rescue channels, estimates waste risk,
calculates economic value recovered, and recommends actions.
"""

def run_marketmind(input_data):
    """
    Allocates expected harvest quantity to commercial and rescue destinations,
    performs surplus classification, waste risk evaluation, economic value calculations,
    and produces explainable recommended actions.
    
    Args:
        input_data (dict): Dictionary containing:
            - expected_yield_kg (float/int): The predicted harvest quantity.
            - destinations (dict): Dictionary mapping destination names to their demand/capacity.
            - crop (str, optional): The name of the crop.
            - price_per_kg (float/int, optional): The crop price per kg in INR.
            
    Returns:
        dict: Structured decision output matching the FarmFlow contract.
    """
    # 1. Input Validation
    if not isinstance(input_data, dict):
        raise ValueError("Input data must be a dictionary")
        
    expected_yield = input_data.get("expected_yield_kg")
    if expected_yield is None:
        raise ValueError("Missing required field: expected_yield_kg")
        
    if not isinstance(expected_yield, (int, float)) or isinstance(expected_yield, bool):
        raise ValueError("expected_yield_kg must be a number")
        
    if expected_yield < 0:
        raise ValueError("expected_yield_kg cannot be negative")
        
    dest_input = input_data.get("destinations")
    if dest_input is None:
        dest_input = {}
        
    if not isinstance(dest_input, dict):
        raise ValueError("destinations must be a dictionary")
        
    # Validate destination capacities
    destinations = {}
    for k, v in dest_input.items():
        if v is None:
            continue
        if not isinstance(v, (int, float)) or isinstance(v, bool):
            raise ValueError(f"Capacity for destination '{k}' must be a number")
        if v < 0:
            raise ValueError(f"Capacity for destination '{k}' cannot be negative")
        destinations[k] = v

    # Optional input validations
    crop = input_data.get("crop")
    if crop is not None and not isinstance(crop, str):
        raise ValueError("crop must be a string")

    market_demand = input_data.get("market_demand")
    if market_demand is not None:
        if not isinstance(market_demand, (int, float)) or isinstance(market_demand, bool):
            raise ValueError("market_demand must be a number")
        if market_demand < 0:
            raise ValueError("market_demand cannot be negative")

    price_per_kg = input_data.get("price_per_kg")
    if price_per_kg is not None:
        if not isinstance(price_per_kg, (int, float)) or isinstance(price_per_kg, bool):
            raise ValueError("price_per_kg must be a number")
        if price_per_kg < 0:
            raise ValueError("price_per_kg cannot be negative")

    # 2. Classification of destinations
    alternative_keywords = ["rescue", "ngo", "community", "kitchen", "alternative", "charity", "donation", "foodbank"]
    
    normal_destinations = {}
    alternative_destinations = {}
    
    for name, capacity in destinations.items():
        name_lower = name.lower()
        if any(keyword in name_lower for keyword in alternative_keywords):
            alternative_destinations[name] = capacity
        else:
            normal_destinations[name] = capacity

    # If explicit market_demand was provided, override or configure normal commercial demand
    if market_demand is not None:
        if normal_destinations:
            # Scale or assign primary commercial market to the explicit market_demand
            primary_key = list(normal_destinations.keys())[0]
            normal_destinations = {primary_key: float(market_demand)}
        else:
            normal_destinations = {"market_a": float(market_demand)}

    # Helper function to format destination names
    def format_destination_name(key):
        mapping = {
            "market_a": "Market A",
            "market_b": "Market B",
            "restaurants": "Restaurants",
            "food_rescue": "Food Rescue",
            "ngo": "NGO",
            "community_kitchens": "Community Kitchens",
            "community": "Community",
            "alternative_market": "Alternative Market"
        }
        key_lower = key.lower()
        if key_lower in mapping:
            return mapping[key_lower]
        
        parts = key.replace("_", " ").split()
        formatted = " ".join(p.upper() if p.lower() in ["ngo", "uv", "co2"] else p.capitalize() for p in parts)
        return formatted

    # 3. Allocation logic
    remaining_harvest = expected_yield
    allocations = []
    
    # Sort normal destinations to make allocation deterministic
    for name, capacity in normal_destinations.items():
        allocated = min(capacity, remaining_harvest)
        if allocated > 0:
            allocations.append({
                "destination": format_destination_name(name),
                "quantity_kg": allocated
            })
            remaining_harvest -= allocated
            
    # Calculate initial surplus (surplus before alternative allocations)
    total_normal_demand = sum(normal_destinations.values())
    initial_surplus = max(0.0, expected_yield - total_normal_demand)
    
    # Sort alternative destinations deterministically (rescue first, then ngo, then others)
    def alternative_priority(item):
        name = item[0].lower()
        if "rescue" in name:
            return 0
        if "ngo" in name:
            return 1
        if "community" in name:
            return 2
        return 3
        
    sorted_alternatives = sorted(alternative_destinations.items(), key=alternative_priority)
    
    # Allocate surplus to alternative destinations
    total_alternative_allocated = 0.0
    for name, capacity in sorted_alternatives:
        allocated = min(capacity, remaining_harvest)
        if allocated > 0:
            allocations.append({
                "destination": format_destination_name(name),
                "quantity_kg": allocated
            })
            remaining_harvest -= allocated
            total_alternative_allocated += allocated
            
    # Calculations
    food_rescued = total_alternative_allocated
    waste_avoided = total_alternative_allocated
    remaining_unallocated = remaining_harvest

    # ==================================================
    # 1. SURPLUS CLASSIFICATION
    # ==================================================
    if expected_yield > 0:
        surplus_percentage = (initial_surplus / expected_yield) * 100
    else:
        surplus_percentage = 0.0

    if surplus_percentage == 0:
        surplus_level = "BALANCED"
    elif surplus_percentage <= 15:
        surplus_level = "LOW_SURPLUS"
    elif surplus_percentage <= 30:
        surplus_level = "MODERATE_SURPLUS"
    else:
        surplus_level = "CRITICAL_SURPLUS"

    # ==================================================
    # 2. WASTE RISK
    # ==================================================
    if expected_yield > 0:
        waste_risk_percentage = (remaining_unallocated / expected_yield) * 100
    else:
        waste_risk_percentage = 0.0

    if waste_risk_percentage == 0:
        waste_risk_level = "NONE"
    elif waste_risk_percentage <= 10:
        waste_risk_level = "LOW"
    elif waste_risk_percentage <= 25:
        waste_risk_level = "MODERATE"
    else:
        waste_risk_level = "HIGH"

    # ==================================================
    # 3. ECONOMIC VALUE RECOVERED & AT RISK
    # ==================================================
    # Comprehensive crop pricing map matching all supported crops
    default_crop_prices = {
        "tomato": 40.0,
        "potato": 30.0,
        "onion": 35.0,
        "rice": 45.0,
        "wheat": 30.0,
        "maize": 28.0,
        "cotton": 65.0,
        "sugarcane": 20.0,
        "soybean": 50.0,
        "chili": 80.0,
        "banana": 25.0,
        "carrot": 35.0,
        "cabbage": 30.0,
    }

    if price_per_kg is None:
        if crop is not None:
            price_per_kg = default_crop_prices.get(crop.strip().lower(), 30.0)
        else:
            price_per_kg = 30.0

    economic_value_recovered_inr = round(food_rescued * price_per_kg, 2)
    economic_value_at_risk_inr = round(remaining_unallocated * price_per_kg, 2)

    # Clean rounding for output serialization
    initial_surplus = round(initial_surplus, 2)
    food_rescued = round(food_rescued, 2)
    waste_avoided = round(waste_avoided, 2)
    remaining_unallocated = round(remaining_unallocated, 2)
    surplus_percentage = round(surplus_percentage, 2)
    waste_risk_percentage = round(waste_risk_percentage, 2)

    # ==================================================
    # 4. RECOMMENDED ACTION
    # ==================================================
    if expected_yield == 0:
        recommended_action = "NO_HARVEST_AVAILABLE"
    elif initial_surplus == 0:
        recommended_action = "NORMAL_MARKET_ALLOCATION"
    elif remaining_unallocated > 0 and waste_risk_level == "HIGH":
        recommended_action = "URGENT_SURPLUS_RESCUE"
    elif food_rescued > 0 and remaining_unallocated == 0:
        recommended_action = "ROUTE_SURPLUS_TO_FOOD_RESCUE"
    elif food_rescued > 0 and remaining_unallocated > 0:
        recommended_action = "ROUTE_REMAINING_SURPLUS_TO_ADDITIONAL_RESCUE"
    else:
        recommended_action = "ROUTE_REMAINING_SURPLUS_TO_ADDITIONAL_RESCUE"

    # ==================================================
    # 5. HUMAN-READABLE DECISION REASON
    # ==================================================
    def format_num(val):
        if isinstance(val, int):
            return val
        if isinstance(val, float) and val.is_integer():
            return int(val)
        return round(val, 2)

    if expected_yield == 0:
        decision_reason = "No harvest available for allocation."
    elif initial_surplus == 0:
        decision_reason = "Harvest matches commercial demand. No surplus detected."
    elif len(destinations) == 0:
        decision_reason = f"No commercial destinations configured. 100% of {format_num(expected_yield)} kg harvest is at risk without rescue routing."
    elif food_rescued > 0 and remaining_unallocated == 0:
        decision_reason = f"{format_num(initial_surplus)} kg surplus detected. All surplus can be redirected through rescue channels, preventing estimated food waste."
    elif remaining_unallocated > 0:
        decision_reason = f"{format_num(remaining_unallocated)} kg remains unallocated after all available destinations are filled. Additional rescue capacity is required (₹{format_num(economic_value_at_risk_inr)} at risk)."
    else:
        decision_reason = f"Surplus of {format_num(initial_surplus)} kg detected with {format_num(remaining_unallocated)} kg unallocated."

    return {
        "surplus_kg": initial_surplus,
        "food_rescued_kg": food_rescued,
        "waste_avoided_kg": waste_avoided,
        "remaining_unallocated_kg": remaining_unallocated,
        "allocations": allocations,
        "surplus_percentage": surplus_percentage,
        "surplus_level": surplus_level,
        "waste_risk_percentage": waste_risk_percentage,
        "waste_risk_level": waste_risk_level,
        "price_per_kg": price_per_kg,
        "economic_value_recovered_inr": economic_value_recovered_inr,
        "economic_value_at_risk_inr": economic_value_at_risk_inr,
        "market_demand_kg": round(total_normal_demand, 2),
        "recommended_action": recommended_action,
        "decision_reason": decision_reason,
    }
