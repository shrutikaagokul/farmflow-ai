/**
 * MarketMind Agent
 * Matches predicted harvest with destination demand/capacity, detects surplus,
 * and routes surplus to alternative rescue channels to minimize food waste.
 */

export function runMarketMind(inputData) {
  // 1. Validation and Graceful Handling of missing/empty inputs
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

  // Helper function to map keys to formatted display names
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
    
    // Generic Title Case conversion
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
    return a[0].localeCompare(b[0]); // alphabetical secondary sort
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

  return {
    surplus_kg: initialSurplus,
    food_rescued_kg: foodRescued,
    waste_avoided_kg: wasteAvoided,
    remaining_unallocated_kg: remainingUnallocated,
    allocations: allocations
  };
}
