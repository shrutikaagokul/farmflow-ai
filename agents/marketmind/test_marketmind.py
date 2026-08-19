import unittest
from marketmind import run_marketmind

class TestMarketMind(unittest.TestCase):

    def test_scenario_a_balanced_market(self):
        """Test A: Normal balanced market where harvest equals demand exactly."""
        input_data = {
            "expected_yield_kg": 1000,
            "destinations": {
                "market_a": 600,
                "market_b": 400
            }
        }
        result = run_marketmind(input_data)
        self.assertEqual(result["surplus_kg"], 0)
        self.assertEqual(result["food_rescued_kg"], 0)
        self.assertEqual(result["waste_avoided_kg"], 0)
        self.assertEqual(result["remaining_unallocated_kg"], 0)
        
        # Verify allocations sum matches harvest
        total_allocated = sum(item["quantity_kg"] for item in result["allocations"])
        self.assertEqual(total_allocated, 1000)

    def test_scenario_b_surplus_with_rescue(self):
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
        
        # Verify expected numbers based on Test B specs
        self.assertEqual(result["surplus_kg"], 290) # before alternative allocation
        self.assertEqual(result["food_rescued_kg"], 290)
        self.assertEqual(result["waste_avoided_kg"], 290)
        self.assertEqual(result["remaining_unallocated_kg"], 0)
        
        # Verify allocations list
        allocations_dict = {item["destination"]: item["quantity_kg"] for item in result["allocations"]}
        self.assertEqual(allocations_dict["Market A"], 600)
        self.assertEqual(allocations_dict["Market B"], 350)
        self.assertEqual(allocations_dict["Restaurants"], 180)
        self.assertEqual(allocations_dict["Food Rescue"], 200)
        self.assertEqual(allocations_dict["NGO"], 90)

    def test_scenario_c_large_surplus(self):
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
        self.assertEqual(result["surplus_kg"], 1500)
        self.assertEqual(result["food_rescued_kg"], 300) # limited by capacity (200 + 100)
        self.assertEqual(result["waste_avoided_kg"], 300)
        self.assertEqual(result["remaining_unallocated_kg"], 1200) # 1500 - 300
        
        # Verify allocations do not exceed capacities
        allocations_dict = {item["destination"]: item["quantity_kg"] for item in result["allocations"]}
        self.assertEqual(allocations_dict["Market A"], 500)
        self.assertEqual(allocations_dict["Food Rescue"], 200)
        self.assertEqual(allocations_dict["NGO"], 100)

    def test_scenario_d_low_harvest(self):
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
        self.assertEqual(result["surplus_kg"], 0)
        self.assertEqual(result["food_rescued_kg"], 0)
        self.assertEqual(result["waste_avoided_kg"], 0)
        self.assertEqual(result["remaining_unallocated_kg"], 0)
        
        # Total allocation should be exactly harvest (500)
        total_allocated = sum(item["quantity_kg"] for item in result["allocations"])
        self.assertEqual(total_allocated, 500)
        
        # Allocate to market_a first up to capacity, then market_b
        allocations_dict = {item["destination"]: item["quantity_kg"] for item in result["allocations"]}
        self.assertEqual(allocations_dict.get("Market A"), 500)
        self.assertNotIn("Market B", allocations_dict)
        self.assertNotIn("Food Rescue", allocations_dict)

    def test_scenario_e_market_demand_change(self):
        """Test E: Dynamic demand recalculation simulation."""
        # Initial run
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
        self.assertEqual(res1["surplus_kg"], 290)
        
        # Reduced demand for Market A
        changed_input = {
            "expected_yield_kg": 1420,
            "destinations": {
                "market_a": 350,  # demand reduced by 250 kg
                "market_b": 350,
                "restaurants": 180,
                "food_rescue": 200,
                "ngo": 100,
                "community_kitchens": 300 # add extra capacity to absorb surplus
            }
        }
        res2 = run_marketmind(changed_input)
        
        # New normal demand = 350 + 350 + 180 = 880
        # New surplus = 1420 - 880 = 540
        self.assertEqual(res2["surplus_kg"], 540)
        self.assertEqual(res2["food_rescued_kg"], 540) # 200 (Rescue) + 100 (NGO) + 240 (Community)
        self.assertEqual(res2["waste_avoided_kg"], 540)
        self.assertEqual(res2["remaining_unallocated_kg"], 0)
        
        allocations_dict = {item["destination"]: item["quantity_kg"] for item in res2["allocations"]}
        self.assertEqual(allocations_dict["Market A"], 350)
        self.assertEqual(allocations_dict["Food Rescue"], 200)
        self.assertEqual(allocations_dict["NGO"], 100)
        self.assertEqual(allocations_dict["Community Kitchens"], 240)

    def test_edge_cases(self):
        """Test miscellaneous edge cases."""
        # 1. Zero destination capacity
        input_zero = {
            "expected_yield_kg": 100,
            "destinations": {
                "market_a": 0,
                "food_rescue": 100
            }
        }
        res = run_marketmind(input_zero)
        self.assertEqual(res["surplus_kg"], 100)
        self.assertEqual(res["food_rescued_kg"], 100)
        self.assertEqual(res["allocations"], [{"destination": "Food Rescue", "quantity_kg": 100}])
        
        # 2. Empty destinations list
        input_empty = {
            "expected_yield_kg": 500,
            "destinations": {}
        }
        res = run_marketmind(input_empty)
        self.assertEqual(res["surplus_kg"], 500)
        self.assertEqual(res["food_rescued_kg"], 0)
        self.assertEqual(res["remaining_unallocated_kg"], 500)
        self.assertEqual(res["allocations"], [])
        
        # 3. Invalid negative harvest
        with self.assertRaises(ValueError):
            run_marketmind({"expected_yield_kg": -10, "destinations": {}})

        # 4. Invalid non-numeric harvest
        with self.assertRaises(ValueError):
            run_marketmind({"expected_yield_kg": "large", "destinations": {}})

        # 5. Invalid negative destination capacity
        with self.assertRaises(ValueError):
            run_marketmind({"expected_yield_kg": 100, "destinations": {"market_a": -5}})

if __name__ == "__main__":
    unittest.main()
