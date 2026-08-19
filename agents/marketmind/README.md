# MarketMind Agent

MarketMind is the zero-waste supply-chain agent for the **FarmFlow AI** multi-agent decision pipeline. It is responsible for matching the predicted harvest (received from CropGuard) with the current demand and capacity across normal and alternative destinations.

Its primary goals are:
1. Allocating available harvest to primary commercial channels.
2. Detecting perishable surplus produce.
3. Automatically routing surplus to rescue channels (Food Rescue, NGOs, Community Kitchens, etc.).
4. Calculating key metrics: `food_rescued_kg`, `waste_avoided_kg`, and `remaining_unallocated_kg`.

---

## 1. Input Contract

MarketMind accepts a structured dictionary/object containing:
* `expected_yield_kg` (numeric, non-negative): The harvest quantity predicted by CropGuard.
* `destinations` (dict/object): A mapping of destination names (e.g., `"market_a"`, `"food_rescue"`) to their available capacity/demand.

### Input JSON Example
```json
{
  "expected_yield_kg": 1420,
  "destinations": {
    "market_a": 600,
    "market_b": 350,
    "restaurants": 180,
    "food_rescue": 200,
    "ngo": 100
  }
}
```

---

## 2. Output Contract

MarketMind returns a structured decision response containing:
* `surplus_kg` (numeric): The initial surplus before alternative allocations.
* `food_rescued_kg` (numeric): The total quantity redirected to alternative rescue channels.
* `waste_avoided_kg` (numeric): The quantity of waste prevented (equivalent to the successfully redirected surplus).
* `remaining_unallocated_kg` (numeric): Surplus quantity that could not be allocated to any channel due to capacity limitations.
* `allocations` (array of objects): Detailed list of final allocations with formatted destination display names.

### Output JSON Example
```json
{
  "surplus_kg": 290,
  "food_rescued_kg": 290,
  "waste_avoided_kg": 290,
  "remaining_unallocated_kg": 0,
  "allocations": [
    { "destination": "Market A", "quantity_kg": 600 },
    { "destination": "Market B", "quantity_kg": 350 },
    { "destination": "Restaurants", "quantity_kg": 180 },
    { "destination": "Food Rescue", "quantity_kg": 200 },
    { "destination": "NGO", "quantity_kg": 90 }
  ]
}
```

---

## 3. Integration & Usage

Teammates can call MarketMind easily in either Python or JavaScript.

### Python Integration
```python
from agents.marketmind.marketmind import run_marketmind

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

decision = run_marketmind(input_data)
print(decision["food_rescued_kg"]) # Outputs: 290
```

### JavaScript / ES Modules Integration
```javascript
import { runMarketMind } from "./agents/marketmind/marketmind.js";

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

const decision = runMarketMind(inputData);
console.log(decision.food_rescued_kg); // Outputs: 290
```

---

## 4. Run Tests

To run the test suites locally:

### Python Tests
```bash
python3 -m unittest agents/marketmind/test_marketmind.py
```

### JavaScript Tests
```bash
node agents/marketmind/test_marketmind.js
```
