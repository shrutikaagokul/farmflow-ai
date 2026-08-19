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

function testEdgeCases() {
  // 1. Zero destination capacity
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

  // 2. Empty destinations list
  const inputEmpty = {
    expected_yield_kg: 500,
    destinations: {}
  };
  const resEmpty = runMarketMind(inputEmpty);
  assert.strictEqual(resEmpty.surplus_kg, 500);
  assert.strictEqual(resEmpty.food_rescued_kg, 0);
  assert.strictEqual(resEmpty.remaining_unallocated_kg, 500);
  assert.deepStrictEqual(resEmpty.allocations, []);

  // 3. Invalid inputs
  assert.throws(() => runMarketMind({ expected_yield_kg: -10, destinations: {} }), Error);
  assert.throws(() => runMarketMind({ expected_yield_kg: "large", destinations: {} }), Error);
  assert.throws(() => runMarketMind({ expected_yield_kg: 100, destinations: { market_a: -5 } }), Error);

  console.log("✓ Edge cases passed.");
}

// Run all test cases
try {
  testScenarioABalancedMarket();
  testScenarioBSurplusWithRescue();
  testScenarioCLargeSurplus();
  testScenarioDLowHarvest();
  testScenarioEMarketDemandChange();
  testEdgeCases();
  console.log("\nALL JS TESTS PASSED SUCCESSFULLY!");
} catch (error) {
  console.error("Test failure:", error);
  process.exit(1);
}
