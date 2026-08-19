# MarketMind Agent

MarketMind is the zero-waste supply-chain agent for the **FarmFlow AI** multi-agent decision pipeline. It matches predicted harvest yields (received from CropGuard) with destination demand, identifies perishable surplus produce, redirects surplus to rescue channels, estimates waste risk, calculates economic value recovered, and produces explainable recommendations.

---

## 1. Input Contract

MarketMind accepts a structured dictionary/object containing:
* `expected_yield_kg` (numeric, non-negative, **required**): The crop yield predicted by CropGuard.
* `destinations` (dict/object, **required**): A mapping of destination names to their demand/capacity.
* `crop` (string, **optional**): The name of the crop (e.g. `"Tomato"`, `"Potato"`).
* `price_per_kg` (numeric, non-negative, **optional**): Custom pricing (in INR) per kg for economic evaluation.

### Input JSON Example
```json
{
  "expected_yield_kg": 1420,
  "crop": "Tomato",
  "price_per_kg": 40,
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
* `surplus_percentage` (numeric): Surplus as a percentage of total expected harvest.
* `surplus_level` (string): Classification of surplus (`BALANCED`, `LOW_SURPLUS`, `MODERATE_SURPLUS`, `CRITICAL_SURPLUS`).
* `waste_risk_percentage` (numeric): Unallocated produce as a percentage of total expected harvest.
* `waste_risk_level` (string): Classification of waste risk (`NONE`, `LOW`, `MODERATE`, `HIGH`).
* `price_per_kg` (numeric): The price per kg used for calculations (explicit or crop-map default).
* `economic_value_recovered_inr` (numeric): Preserved crop value in INR (`food_rescued_kg * price_per_kg`).
* `recommended_action` (string): Code action for downstream execution (e.g., `"ROUTE_SURPLUS_TO_FOOD_RESCUE"`).
* `decision_reason` (string): Concise human-readable explanation of why the recommendation was made.

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
  ],
  "surplus_percentage": 20.42,
  "surplus_level": "MODERATE_SURPLUS",
  "waste_risk_percentage": 0.0,
  "waste_risk_level": "NONE",
  "price_per_kg": 40.0,
  "economic_value_recovered_inr": 11600.0,
  "recommended_action": "ROUTE_SURPLUS_TO_FOOD_RESCUE",
  "decision_reason": "290 kg surplus detected. All surplus can be redirected through rescue channels, preventing estimated food waste."
}
```

---

## 3. Allocation Strategy

1. **Primary Demand:** Harvest is first allocated to normal commercial channels up to their capacity.
2. **Alternative Rescue:** Remaining harvest (surplus) is redirected to rescue channels (e.g., Food Rescue, NGOs, Community Distribution) in priority order.
3. **Surplus Level Classifications:**
   * `0%` &rarr; `BALANCED`
   * `0%` to `15%` &rarr; `LOW_SURPLUS`
   * `15%` to `30%` &rarr; `MODERATE_SURPLUS`
   * `> 30%` &rarr; `CRITICAL_SURPLUS`
4. **Waste Risk Classifications:**
   * `0%` &rarr; `NONE`
   * `0%` to `10%` &rarr; `LOW`
   * `10%` to `25%` &rarr; `MODERATE`
   * `> 25%` &rarr; `HIGH`

---

## 4. Economic Value Pricing Defaults

If `price_per_kg` is not explicitly provided, a fallback prototype crop price mapping is used:
* **Tomato:** 40 INR
* **Potato:** 30 INR
* **Onion:** 35 INR
* **Rice:** 45 INR
* **Wheat:** 30 INR
* **Banana:** 25 INR
* **Carrot:** 35 INR
* **Cabbage:** 30 INR
* **Unknown crops:** 30 INR default.

*Note: These prices are hackathon prototype estimates, not live market data.*

---

## 5. recommended_action Selection Rules

1. `expected_yield_kg == 0` &rarr; `"NO_HARVEST_AVAILABLE"`
2. `surplus_kg == 0` &rarr; `"NORMAL_MARKET_ALLOCATION"`
3. `remaining_unallocated_kg > 0 AND waste_risk_level == "HIGH"` &rarr; `"URGENT_SURPLUS_RESCUE"`
4. `food_rescued_kg > 0 AND remaining_unallocated_kg == 0` &rarr; `"ROUTE_SURPLUS_TO_FOOD_RESCUE"`
5. `food_rescued_kg > 0 AND remaining_unallocated_kg > 0` &rarr; `"ROUTE_REMAINING_SURPLUS_TO_ADDITIONAL_RESCUE"`

---

## 6. Run Tests

To run the test suites locally:

### Python Tests (via pytest)
```bash
python -m pytest agents/marketmind/test_marketmind.py -v
```

### JavaScript Tests (via Node.js)
```bash
node agents/marketmind/test_marketmind.js
```
