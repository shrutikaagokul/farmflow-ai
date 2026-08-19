import assert from 'assert';
import { runMarketMind } from './marketmind.js';

console.log("Running MarketMind JavaScript Test Suite...");

function testScenarioABalancedMarket() {
  const inputData = {
    expected_yield_kg: 1000,
    destinations: {
      market_a: 600,
      market_b: 400
    }
  };
  const result = runMarketMind(inputData);
  assert.strictEqual(result.surplus_kg, 0);
  assert.strictEqual(result.food_rescued_kg, 0);
  assert.strictEqual(result.waste_avoided_kg, 0);
  assert.strictEqual(result.remaining_unallocated_kg, 0);
  
  const totalAllocated = result.allocations.reduce((sum, item) => sum + item.quantity_kg, 0);
  assert.strictEqual(totalAllocated, 1000);
  console.log("✓ Test A: Balanced Market passed.");
}

function testScenarioBSurplusWithRescue() {
  const inputData = {
    expected_yield_kg: 1420,
    destinations: {
      market_a: 600,
      market_b: 350,
      restaurants: 180,
      food_rescue: 200,
      ngo: 100
    }
  };
  const result = runMarketMind(inputData);
  assert.strictEqual(result.surplus_kg, 290);
  assert.strictEqual(result.food_rescued_kg, 290);
  assert.strictEqual(result.waste_avoided_kg, 290);
  assert.strictEqual(result.remaining_unallocated_kg, 0);
  
  const allocationsMap = {};
  for (const item of result.allocations) {
    allocationsMap[item.destination] = item.quantity_kg;
  }
  assert.strictEqual(allocationsMap["Market A"], 600);
  assert.strictEqual(allocationsMap["Market B"], 350);
  assert.strictEqual(allocationsMap["Restaurants"], 180);
  assert.strictEqual(allocationsMap["Food Rescue"], 200);
  assert.strictEqual(allocationsMap["NGO"], 90);
  console.log("✓ Test B: Surplus with Rescue passed.");
}

function testScenarioCLargeSurplus() {
  const inputData = {
    expected_yield_kg: 2000,
    destinations: {
      market_a: 500,
      food_rescue: 200,
      ngo: 100
    }
  };
  const result = runMarketMind(inputData);
  assert.strictEqual(result.surplus_kg, 1500);
  assert.strictEqual(result.food_rescued_kg, 300);
  assert.strictEqual(result.waste_avoided_kg, 300);
  assert.strictEqual(result.remaining_unallocated_kg, 1200);

  const allocationsMap = {};
  for (const item of result.allocations) {
    allocationsMap[item.destination] = item.quantity_kg;
  }
  assert.strictEqual(allocationsMap["Market A"], 500);
  assert.strictEqual(allocationsMap["Food Rescue"], 200);
  assert.strictEqual(allocationsMap["NGO"], 100);
  console.log("✓ Test C: Large Surplus passed.");
}

function testScenarioDLowHarvest() {
  const inputData = {
    expected_yield_kg: 500,
    destinations: {
      market_a: 600,
      market_b: 350,
      food_rescue: 200
    }
  };
  const result = runMarketMind(inputData);
  assert.strictEqual(result.surplus_kg, 0);
  assert.strictEqual(result.food_rescued_kg, 0);
  assert.strictEqual(result.waste_avoided_kg, 0);
  assert.strictEqual(result.remaining_unallocated_kg, 0);

  const totalAllocated = result.allocations.reduce((sum, item) => sum + item.quantity_kg, 0);
  assert.strictEqual(totalAllocated, 500);

  const allocationsMap = {};
  for (const item of result.allocations) {
    allocationsMap[item.destination] = item.quantity_kg;
  }
  assert.strictEqual(allocationsMap["Market A"], 500);
  assert.strictEqual(allocationsMap["Market B"], undefined);
  assert.strictEqual(allocationsMap["Food Rescue"], undefined);
  console.log("✓ Test D: Low Harvest passed.");
}

function testScenarioEMarketDemandChange() {
  const initialInput = {
    expected_yield_kg: 1420,
    destinations: {
      market_a: 600,
      market_b: 350,
      restaurants: 180,
      food_rescue: 200,
      ngo: 100
    }
  };
  const res1 = runMarketMind(initialInput);
  assert.strictEqual(res1.surplus_kg, 290);

  const changedInput = {
    expected_yield_kg: 1420,
    destinations: {
      market_a: 350,
      market_b: 350,
      restaurants: 180,
      food_rescue: 200,
      ngo: 100,
      community_kitchens: 300
    }
  };
  const res2 = runMarketMind(changedInput);
  assert.strictEqual(res2.surplus_kg, 540);
  assert.strictEqual(res2.food_rescued_kg, 540);
  assert.strictEqual(res2.waste_avoided_kg, 540);
  assert.strictEqual(res2.remaining_unallocated_kg, 0);

  const allocationsMap = {};
  for (const item of res2.allocations) {
    allocationsMap[item.destination] = item.quantity_kg;
  }
  assert.strictEqual(allocationsMap["Market A"], 350);
  assert.strictEqual(allocationsMap["Food Rescue"], 200);
  assert.strictEqual(allocationsMap["NGO"], 100);
  assert.strictEqual(allocationsMap["Community Kitchens"], 240);
  console.log("✓ Test E: Market Demand Change passed.");
}

function testLegacyEdgeCases() {
  const inputZero = {
    expected_yield_kg: 100,
    destinations: {
      market_a: 0,
      food_rescue: 100
    }
  };
  const res = runMarketMind(inputZero);
  assert.strictEqual(res.surplus_kg, 100);
  assert.strictEqual(res.food_rescued_kg, 100);
  assert.deepStrictEqual(res.allocations, [{ destination: "Food Rescue", quantity_kg: 100 }]);

  const inputEmpty = {
    expected_yield_kg: 500,
    destinations: {}
  };
  const resEmpty = runMarketMind(inputEmpty);
  assert.strictEqual(resEmpty.surplus_kg, 500);
  assert.strictEqual(resEmpty.food_rescued_kg, 0);
  assert.strictEqual(resEmpty.remaining_unallocated_kg, 500);
  assert.deepStrictEqual(resEmpty.allocations, []);

  assert.throws(() => runMarketMind({ expected_yield_kg: -10, destinations: {} }), Error);
  assert.throws(() => runMarketMind({ expected_yield_kg: "large", destinations: {} }), Error);
  assert.throws(() => runMarketMind({ expected_yield_kg: 100, destinations: { market_a: -5 } }), Error);

  console.log("✓ Legacy Edge cases passed.");
}

// New tests matching Python
function testNewClassifications() {
  // Balanced Harvest
  let res = runMarketMind({ expected_yield_kg: 1000, destinations: { market_a: 1000 } });
  assert.strictEqual(res.surplus_percentage, 0.0);
  assert.strictEqual(res.surplus_level, "BALANCED");

  // Low Surplus
  res = runMarketMind({ expected_yield_kg: 1100, destinations: { market_a: 1000 } });
  assert.strictEqual(res.surplus_level, "LOW_SURPLUS");

  // Moderate Surplus
  res = runMarketMind({ expected_yield_kg: 1250, destinations: { market_a: 1000 } });
  assert.strictEqual(res.surplus_level, "MODERATE_SURPLUS");

  // Critical Surplus
  res = runMarketMind({ expected_yield_kg: 1500, destinations: { market_a: 1000 } });
  assert.strictEqual(res.surplus_level, "CRITICAL_SURPLUS");

  // Zero Harvest
  res = runMarketMind({ expected_yield_kg: 0, destinations: { market_a: 100 } });
  assert.strictEqual(res.surplus_level, "BALANCED");
  assert.strictEqual(res.waste_risk_level, "NONE");
  assert.strictEqual(res.recommended_action, "NO_HARVEST_AVAILABLE");

  // High Waste Risk
  res = runMarketMind({ expected_yield_kg: 1500, destinations: { market_a: 1000 } });
  assert.strictEqual(res.waste_risk_level, "HIGH");

  console.log("✓ New classifications passed.");
}

function testEconomicPricing() {
  // Default Tomato
  let res = runMarketMind({ expected_yield_kg: 1200, crop: "Tomato", destinations: { market_a: 1000, food_rescue: 200 } });
  assert.strictEqual(res.price_per_kg, 40.0);
  assert.strictEqual(res.economic_value_recovered_inr, 8000.0);

  // Explicit overrides
  res = runMarketMind({ expected_yield_kg: 1200, crop: "Tomato", price_per_kg: 50.0, destinations: { market_a: 1000, food_rescue: 200 } });
  assert.strictEqual(res.price_per_kg, 50.0);
  assert.strictEqual(res.economic_value_recovered_inr, 10000.0);

  // Default unknown
  res = runMarketMind({ expected_yield_kg: 1200, crop: "DragonFruit", destinations: { market_a: 1000, food_rescue: 200 } });
  assert.strictEqual(res.price_per_kg, 30.0);

  // Validations
  assert.throws(() => runMarketMind({ expected_yield_kg: 100, crop: 123 }), Error);
  assert.throws(() => runMarketMind({ expected_yield_kg: 100, price_per_kg: "free" }), Error);
  assert.throws(() => runMarketMind({ expected_yield_kg: 100, price_per_kg: -20 }), Error);

  console.log("✓ Economic pricing and validation passed.");
}

// Run all test cases
try {
  testScenarioABalancedMarket();
  testScenarioBSurplusWithRescue();
  testScenarioCLargeSurplus();
  testScenarioDLowHarvest();
  testScenarioEMarketDemandChange();
  testLegacyEdgeCases();
  testNewClassifications();
  testEconomicPricing();
  console.log("\nALL JS TESTS PASSED SUCCESSFULLY!");
} catch (error) {
  console.error("Test failure:", error);
  process.exit(1);
}
