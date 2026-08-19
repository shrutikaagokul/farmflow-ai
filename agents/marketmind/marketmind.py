"""
MarketMind Agent
Matches predicted harvest with destination demand/capacity, detects surplus,
and routes surplus to alternative rescue channels to minimize food waste.
"""

def run_marketmind(input_data):
    """
    Allocates expected harvest quantity to commercial and rescue destinations.
    
    Args:
        input_data (dict): Dictionary containing:
            - expected_yield_kg (float/int): The predicted harvest quantity.
            - destinations (dict): Dictionary mapping destination names to their demand/capacity.
            
    Returns:
        dict: Structured decision output matching the FarmFlow contract.
    """
    # 1. Validation and Graceful Handling of missing/empty inputs
    if not isinstance(input_data, dict):
        raise ValueError("Input data must be a dictionary")
        
    expected_yield = input_data.get("expected_yield_kg")
    if expected_yield is None:
        raise ValueError("Missing required field: expected_yield_kg")
        
    if not isinstance(expected_yield, (int, float)):
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
        if not isinstance(v, (int, float)):
            raise ValueError(f"Capacity for destination '{k}' must be a number")
        if v < 0:
            raise ValueError(f"Capacity for destination '{k}' cannot be negative")
        destinations[k] = v

    # 2. Classification of destinations
    # Normal: Markets, Restaurants, etc. (commercial)
    # Alternative: Food Rescue, NGO, Community Kitchens, etc. (rescue/aid)
    alternative_keywords = ["rescue", "ngo", "community", "kitchen", "alternative", "charity", "donation", "foodbank"]
    
    normal_destinations = {}
    alternative_destinations = {}
    
    for name, capacity in destinations.items():
        name_lower = name.lower()
        if any(keyword in name_lower for keyword in alternative_keywords):
            alternative_destinations[name] = capacity
        else:
            normal_destinations[name] = capacity

    # Helper function to map keys to formatted display names
    def format_destination_name(key):
        # Specific mappings
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
        # Generic Title Case conversion
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
    # food_rescued_kg: quantity redirected to rescue/NGO/community
    # waste_avoided_kg: quantity successfully redirected that would otherwise be waste
    food_rescued = total_alternative_allocated
    waste_avoided = total_alternative_allocated
    remaining_unallocated = remaining_harvest

    return {
        "surplus_kg": initial_surplus,
        "food_rescued_kg": food_rescued,
        "waste_avoided_kg": waste_avoided,
        "remaining_unallocated_kg": remaining_unallocated,
        "allocations": allocations
    }
