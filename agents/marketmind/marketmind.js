/**
 * MarketMind Agent
 * Matches predicted harvest with destination demand/capacity, detects surplus,
 * routes surplus to alternative rescue channels, estimates waste risk,
 * calculates economic value recovered, and recommends actions.
 */

export function runMarketMind(inputData) {
  // 1. Input Validation
  if (!inputData || typeof inputData !== 'object' || Array.isArray(inputData)) {
    throw new Error("Input data must be an object");
  }

  const expectedYield = inputData.expected_yield_kg;
  if (expectedYield === undefined) {
    throw new Error("Missing required field: expected_yield_kg");
  }

  if (typeof expectedYield !== 'number') {
    throw new Error("expected_yield_kg must be a number");
  }

  if (expectedYield < 0) {
    throw new Error("expected_yield_kg cannot be negative");
  }

  let destInput = inputData.destinations;
  if (destInput === undefined || destInput === null) {
    destInput = {};
  }

  if (typeof destInput !== 'object' || Array.isArray(destInput)) {
    throw new Error("destinations must be an object");
  }

  // Validate destination capacities
  const destinations = {};
  for (const [key, value] of Object.entries(destInput)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value !== 'number') {
      throw new Error(`Capacity for destination '${key}' must be a number`);
    }
    if (value < 0) {
      throw new Error(`Capacity for destination '${key}' cannot be negative`);
    }
    destinations[key] = value;
  }

  // Optional validations
  const crop = inputData.crop;
  if (crop !== undefined && crop !== null && typeof crop !== 'string') {
    throw new Error("crop must be a string");
  }

  let pricePerKg = inputData.price_per_kg;
  if (pricePerKg !== undefined && pricePerKg !== null) {
    if (typeof pricePerKg !== 'number') {
      throw new Error("price_per_kg must be a number");
    }
    if (pricePerKg < 0) {
      throw new Error("price_per_kg cannot be negative");
    }
  }

  // 2. Classification of destinations
  const alternativeKeywords = ["rescue", "ngo", "community", "kitchen", "alternative", "charity", "donation", "foodbank"];
  
  const normalDestinations = {};
  const alternativeDestinations = {};

  for (const [name, capacity] of Object.entries(destinations)) {
    const nameLower = name.toLowerCase();
    const isAlternative = alternativeKeywords.some(keyword => nameLower.includes(keyword));
    if (isAlternative) {
      alternativeDestinations[name] = capacity;
    } else {
      normalDestinations[name] = capacity;
    }
  }

  // Helper function to format destination names
  function formatDestinationName(key) {
    const mapping = {
      "market_a": "Market A",
      "market_b": "Market B",
      "restaurants": "Restaurants",
      "food_rescue": "Food Rescue",
      "ngo": "NGO",
      "community_kitchens": "Community Kitchens",
      "community": "Community",
      "alternative_market": "Alternative Market"
    };
    const keyLower = key.toLowerCase();
    if (mapping[keyLower]) {
      return mapping[keyLower];
    }
    
    const parts = key.replace(/_/g, " ").split(" ");
    const formatted = parts.map(p => {
      const pLower = p.toLowerCase();
      if (["ngo", "uv", "co2"].includes(pLower)) {
        return p.toUpperCase();
      }
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    }).join(" ");
    return formatted;
  }

  // 3. Allocation logic
  let remainingHarvest = expectedYield;
  const allocations = [];

  // Allocate normal destinations
  for (const [name, capacity] of Object.entries(normalDestinations)) {
    const allocated = Math.min(capacity, remainingHarvest);
    if (allocated > 0) {
      allocations.push({
        destination: formatDestinationName(name),
        quantity_kg: allocated
      });
      remainingHarvest -= allocated;
    }
  }

  // Calculate initial surplus
  const totalNormalDemand = Object.values(normalDestinations).reduce((sum, val) => sum + val, 0);
  const initialSurplus = Math.max(0.0, expectedYield - totalNormalDemand);

  // Sort alternative destinations deterministically (rescue first, then ngo, then others)
  function getAlternativePriority(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("rescue")) return 0;
    if (nameLower.includes("ngo")) return 1;
    if (nameLower.includes("community")) return 2;
    return 3;
  }

  const sortedAlternatives = Object.entries(alternativeDestinations).sort((a, b) => {
    const prioA = getAlternativePriority(a[0]);
    const prioB = getAlternativePriority(b[0]);
    if (prioA !== prioB) {
      return prioA - prioB;
    }
    return a[0].localeCompare(b[0]);
  });

  // Allocate surplus to alternative destinations
  let totalAlternativeAllocated = 0.0;
  for (const [name, capacity] of sortedAlternatives) {
    const allocated = Math.min(capacity, remainingHarvest);
    if (allocated > 0) {
      allocations.push({
        destination: formatDestinationName(name),
        quantity_kg: allocated
      });
      remainingHarvest -= allocated;
      totalAlternativeAllocated += allocated;
    }
  }

  // Calculations
  const foodRescued = totalAlternativeAllocated;
  const wasteAvoided = totalAlternativeAllocated;
  const remainingUnallocated = remainingHarvest;

  // ==================================================
  // 1. SURPLUS CLASSIFICATION
  // ==================================================
  const surplusPercentage = expectedYield > 0 ? (initialSurplus / expectedYield) * 100 : 0.0;
  let surplusLevel = "BALANCED";
  if (surplusPercentage > 0 && surplusPercentage <= 15) {
    surplusLevel = "LOW_SURPLUS";
  } else if (surplusPercentage > 15 && surplusPercentage <= 30) {
    surplusLevel = "MODERATE_SURPLUS";
  } else if (surplusPercentage > 30) {
    surplusLevel = "CRITICAL_SURPLUS";
  }

  // ==================================================
  // 2. WASTE RISK
  // ==================================================
  const wasteRiskPercentage = expectedYield > 0 ? (remainingUnallocated / expectedYield) * 100 : 0.0;
  let wasteRiskLevel = "NONE";
  if (wasteRiskPercentage > 0 && wasteRiskPercentage <= 10) {
    wasteRiskLevel = "LOW";
  } else if (wasteRiskPercentage > 10 && wasteRiskPercentage <= 25) {
    wasteRiskLevel = "MODERATE";
  } else if (wasteRiskPercentage > 25) {
    wasteRiskLevel = "HIGH";
  }

  // ==================================================
  // 3. ECONOMIC VALUE RECOVERED
  // ==================================================
  const defaultCropPrices = {
    "tomato": 40.0,
    "potato": 30.0,
    "onion": 35.0,
    "rice": 45.0,
    "wheat": 30.0,
    "banana": 25.0,
    "carrot": 35.0,
    "cabbage": 30.0
  };

  if (pricePerKg === undefined || pricePerKg === null) {
    if (crop) {
      pricePerKg = defaultCropPrices[crop.trim().toLowerCase()] || 30.0;
    } else {
      pricePerKg = 30.0;
    }
  }

  const economicValueRecoveredInr = Math.round(foodRescued * pricePerKg * 100) / 100;

  // ==================================================
  // 4. RECOMMENDED ACTION
  // ==================================================
  let recommendedAction = "ROUTE_REMAINING_SURPLUS_TO_ADDITIONAL_RESCUE";
  if (expectedYield === 0) {
    recommendedAction = "NO_HARVEST_AVAILABLE";
  } else if (initialSurplus === 0) {
    recommendedAction = "NORMAL_MARKET_ALLOCATION";
  } else if (remainingUnallocated > 0 && wasteRiskLevel === "HIGH") {
    recommendedAction = "URGENT_SURPLUS_RESCUE";
  } else if (foodRescued > 0 && remainingUnallocated === 0) {
    recommendedAction = "ROUTE_SURPLUS_TO_FOOD_RESCUE";
  }

  // ==================================================
  // 5. HUMAN-READABLE DECISION REASON
  // ==================================================
  function formatNum(val) {
    return Number.isInteger(val) ? val : Math.round(val * 100) / 100;
  }

  let decisionReason = "";
  if (expectedYield === 0) {
    decisionReason = "No harvest available for allocation.";
  } else if (initialSurplus === 0) {
    decisionReason = "Harvest matches commercial demand. No surplus detected.";
  } else if (foodRescued > 0 && remainingUnallocated === 0) {
    decisionReason = `${formatNum(initialSurplus)} kg surplus detected. All surplus can be redirected through rescue channels, preventing estimated food waste.`;
  } else if (remainingUnallocated > 0) {
    decisionReason = `${formatNum(remainingUnallocated)} kg remains unallocated after all available destinations are filled. Additional rescue capacity is required.`;
  } else {
    decisionReason = `Surplus of ${formatNum(initialSurplus)} kg detected with ${formatNum(remainingUnallocated)} kg unallocated.`;
  }

  return {
    surplus_kg: initialSurplus,
    food_rescued_kg: foodRescued,
    waste_avoided_kg: wasteAvoided,
    remaining_unallocated_kg: remainingUnallocated,
    allocations: allocations,
    surplus_percentage: surplusPercentage,
    surplus_level: surplusLevel,
    waste_risk_percentage: wasteRiskPercentage,
    waste_risk_level: wasteRiskLevel,
    price_per_kg: pricePerKg,
    economic_value_recovered_inr: economicValueRecoveredInr,
    recommended_action: recommendedAction,
    decision_reason: decisionReason
  };
}
