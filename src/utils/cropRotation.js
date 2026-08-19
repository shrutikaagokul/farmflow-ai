/**
 * FarmFlow AI — Smart Crop Rotation Decision Support Module
 * -----------------------------------------------------------
 * Deterministic recommendation engine that suggests suitable NEXT crops
 * based on current crop, stage, soil moisture, and farming context.
 *
 * NOTE: This is a decision-support feature, NOT a fifth agent.
 */

export const CROP_ROTATION_DATABASE = {
  Rice: {
    recommendedNext: 'Black Gram / Legumes (உளுந்து)',
    category: 'Nitrogen-Fixing Pulses',
    futureRotation: 'Sesame / Maize',
    reasons: [
      'Fixes atmospheric nitrogen in Cauvery Delta paddy fallows to naturally enrich soil organic matter.',
      'Breaks monoculture pest and weed cycles between rice cultivation seasons.',
      'Thrives on residual paddy soil moisture (30%–50%) with zero additional canal pumping required.',
      'Provides high-value short-duration financial return before the next main paddy cycle.',
    ],
    idealMoistureRange: '30% – 50%',
    seasonSuitability: 'Paddy Fallow / Post-Monsoon',
  },
  Tomato: {
    recommendedNext: 'French Beans / Legumes',
    category: 'Leguminous Vegetable',
    futureRotation: 'Onion / Sweet Corn',
    reasons: [
      'Prevents Solanaceae fungal wilt and root-knot nematode buildup in soil.',
      'Restores soil nitrogen depleted by heavy tomato fruit production.',
      'Provides deep-to-shallow root zone variation for natural soil aeration.',
    ],
    idealMoistureRange: '25% – 40%',
    seasonSuitability: 'Post-Harvest Transition',
  },
  Potato: {
    recommendedNext: 'Mustard / Green Gram',
    category: 'Bio-fumigant / Pulse',
    futureRotation: 'Wheat / Maize',
    reasons: [
      'Mustard root exudates act as natural bio-fumigants against potato cyst nematodes.',
      'Restores soil structure and organic matter after intensive tuber harvesting.',
      'Balances soil nutrient depletion across shallow and deep root zones.',
    ],
    idealMoistureRange: '20% – 35%',
    seasonSuitability: 'Rabi / Spring Transition',
  },
  Onion: {
    recommendedNext: 'Chili / Spices',
    category: 'Spice / Solanaceae',
    futureRotation: 'Paddy / Maize',
    reasons: [
      'Allium root exudates suppress soil-borne pathogens for subsequent vegetable crops.',
      'Complements shallow onion root systems with deeper-rooted chili plants.',
      'Diversifies market exposure across high-demand spice channels.',
    ],
    idealMoistureRange: '25% – 45%',
    seasonSuitability: 'Kharif / Rabi Transition',
  },
  Wheat: {
    recommendedNext: 'Mung Bean (Green Gram)',
    category: 'Short-Duration Pulse',
    futureRotation: 'Rice / Cotton',
    reasons: [
      'Restores soil nitrogen and organic biomass following cereal grain extraction.',
      'Fits seamlessly into summer fallow windows with low water requirements.',
      'Improves microbial diversity in topsoil layers.',
    ],
    idealMoistureRange: '25% – 40%',
    seasonSuitability: 'Zaid / Summer Fallow',
  },
  Maize: {
    recommendedNext: 'Soybean / Groundnut',
    category: 'Oilseed / Legume',
    futureRotation: 'Wheat / Vegetables',
    reasons: [
      'Maize is a heavy nitrogen feeder; soybean replenishes soil nitrogen reservoirs.',
      'Improves soil micro-flora diversity and organic carbon levels.',
      'Protects against armyworm and stalk rot pathogen survival in soil.',
    ],
    idealMoistureRange: '30% – 50%',
    seasonSuitability: 'Kharif / Post-Monsoon',
  },
  Cotton: {
    recommendedNext: 'Pigeon Pea / Sorghum',
    category: 'Pulse / Cereal',
    futureRotation: 'Groundnut / Wheat',
    reasons: [
      'Deep-rooted cotton depletes subsoil nutrients; rotating with pigeon pea balances nutrient extraction layers.',
      'Breaks bollworm and verticillium wilt carryover in field soil.',
      'Enhances soil aeration through taproot decomposition.',
    ],
    idealMoistureRange: '25% – 40%',
    seasonSuitability: 'Post-Cotton Harvest',
  },
  Sugarcane: {
    recommendedNext: 'Green Manure (Sunnhemp) / Legumes',
    category: 'Cover Crop / Nitrogen Fixer',
    futureRotation: 'Paddy / Vegetables',
    reasons: [
      'Replenishes organic matter and soil microbial activity after long sugarcane ratoon cycles.',
      'Fixes up to 80 kg N/ha into soil before the next main crop.',
      'Improves water infiltration and soil porosity.',
    ],
    idealMoistureRange: '35% – 55%',
    seasonSuitability: 'Post-Ratoon Fallow',
  },
  Soybean: {
    recommendedNext: 'Wheat / Mustard',
    category: 'Rabi Cereal / Oilseed',
    futureRotation: 'Cotton / Maize',
    reasons: [
      'Capitalizes on residual nitrogen fixed by soybean roots to boost cereal grain yield.',
      'Maintains healthy soil structure and balanced moisture uptake.',
      'Suppresses weed growth through dense canopy coverage.',
    ],
    idealMoistureRange: '25% – 45%',
    seasonSuitability: 'Rabi Season',
  },
  Chili: {
    recommendedNext: 'Groundnut (Peanut)',
    category: 'Leguminous Oilseed',
    futureRotation: 'Maize / Millets',
    reasons: [
      'Breaks pepper virus and fungal wilt pathogen cycles in the soil.',
      'Enriches nitrogen and organic carbon content for subsequent cereal crops.',
      'Improves soil moisture retention in sandy loam soils.',
    ],
    idealMoistureRange: '25% – 45%',
    seasonSuitability: 'Post-Chili Harvest',
  },
};

/**
 * Recommends the next crop dynamically based on current crop and telemetry.
 */
export function getSmartCropRotation(currentCrop = 'Rice', telemetry = {}) {
  const normalizedCrop = Object.keys(CROP_ROTATION_DATABASE).find(
    (c) => c.toLowerCase() === currentCrop.toLowerCase()
  ) || 'Rice';

  const rotationData = CROP_ROTATION_DATABASE[normalizedCrop];
  const soilMoisture = Number(telemetry.soil_moisture || telemetry.soilMoisture) || 42;

  // Evaluate moisture compatibility
  let moistureNotice = 'Optimal soil moisture for crop transition';
  if (soilMoisture < 20) {
    moistureNotice = 'Low moisture detected — light pre-sowing irrigation recommended for rotation.';
  } else if (soilMoisture > 55) {
    moistureNotice = 'High moisture detected — ensure plot surface drainage before rotation sowing.';
  }

  return {
    currentCrop: normalizedCrop,
    cropStage: telemetry.crop_stage || telemetry.cropStage || 'Vegetative',
    recommendedNext: rotationData.recommendedNext,
    category: rotationData.category,
    futureRotation: rotationData.futureRotation,
    reasons: rotationData.reasons,
    idealMoistureRange: rotationData.idealMoistureRange,
    seasonSuitability: rotationData.seasonSuitability,
    moistureNotice,
    disclaimer: 'Recommendation based on crop rotation patterns and available farm conditions. Soil N-P-K nutrient analysis requires connected soil lab sensors.',
  };
}
