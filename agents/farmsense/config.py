"""
FarmSense — Configuration & Thresholds
=======================================

All configurable constants live here. No magic numbers in the logic.

IMPORTANT: These are hackathon prototype values, not scientifically
validated agricultural parameters. They are designed to produce
sensible demo behavior for a 24-hour hackathon.
"""

# ------------------------------------------------------------------
# Soil Moisture Thresholds (percentage, 0–100)
# ------------------------------------------------------------------
# Below this value, soil moisture is considered "low" and irrigation
# may be needed.
SOIL_MOISTURE_LOW_THRESHOLD = 35

# ------------------------------------------------------------------
# Rain Probability Thresholds (percentage, 0–100)
# ------------------------------------------------------------------
# At or above this value, we consider rain likely enough to delay
# irrigation rather than waste water.
RAIN_PROBABILITY_HIGH_THRESHOLD = 50

# ------------------------------------------------------------------
# Temperature Thresholds (°C)
# ------------------------------------------------------------------
# Above this temperature, crops experience heat stress and may need
# more urgent irrigation even if other factors suggest delay.
HIGH_TEMP_THRESHOLD = 35

# ------------------------------------------------------------------
# Humidity Thresholds (percentage, 0–100)
# ------------------------------------------------------------------
# Below this humidity, evapotranspiration is high and soil dries
# faster, increasing irrigation urgency.
LOW_HUMIDITY_THRESHOLD = 40

# ------------------------------------------------------------------
# Water Usage Estimates (hackathon prototype)
# ------------------------------------------------------------------
# Estimated litres of water used per acre per irrigation cycle.
# This is a rough average for drip irrigation of vegetable crops.
BASE_WATER_USAGE_L_PER_ACRE = 150

# Default farm size in acres (matches the mock data: 12-acre farm).
DEFAULT_FARM_ACRES = 12

# ------------------------------------------------------------------
# Crop Stage Water Multipliers
# ------------------------------------------------------------------
# Different growth stages have different water demands. These
# multipliers adjust the base water usage estimate.
#
# Values are relative: 1.0 = baseline, >1.0 = higher demand.
CROP_STAGE_WATER_MULTIPLIER = {
    "Germination": 0.6,
    "Seedling": 0.7,
    "Vegetative": 0.9,
    "Flowering": 1.0,     # Peak water demand
    "Fruiting": 1.1,      # Highest demand — fruit filling
    "Ripening": 0.8,
    "Harvest": 0.5,
}

# Fallback multiplier if the crop stage is not recognized.
DEFAULT_STAGE_MULTIPLIER = 1.0

# ------------------------------------------------------------------
# Delay Hours Calculation
# ------------------------------------------------------------------
# When we recommend DELAY, we estimate how many hours to wait.
# Higher rain probability → shorter delay (rain arrives sooner).
#
# Formula: MAX_DELAY - (rain_probability / 100) * (MAX_DELAY - MIN_DELAY)
#
# Example: rain_prob=78% → 12 - 0.78*(12-2) = 12 - 7.8 = ~4h
# Example: rain_prob=50% → 12 - 0.50*(12-2) = 12 - 5.0 = 7h
MAX_DELAY_HOURS = 12
MIN_DELAY_HOURS = 2

# ------------------------------------------------------------------
# Irrigation Decision Constants
# ------------------------------------------------------------------
DECISION_IRRIGATE = "IRRIGATE"
DECISION_DELAY = "DELAY"
DECISION_NO_ACTION = "NO_ACTION"
