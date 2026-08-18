/**
 * FarmFlow AI — Autonomous Farm-to-Market Intelligence
 * Centralized Mock Data & Simulation State Definitions
 */

// ============================================
// Farm Profile
// ============================================
export const initialFarmProfile = {
  name: '12-ACRE TOMATO FARM',
  crop: 'Tomato',
  variety: 'Roma Heritage',
  acreage: 12,
  location: 'Karnataka, India',
  stage: 'Flowering',
  systemStatus: 'ACTIVE',
  mode: 'AUTONOMOUS SIMULATION',
};

// ============================================
// Telemetry Data (Default & Weather Change)
// ============================================
export const defaultTelemetry = {
  soilMoisture: 27,
  soilStatus: 'Below optimal threshold (35%)',
  rainProbability: 78,
  rainForecast: 'Moderate precipitation expected in 6h',
  temperature: 34,
  tempUnit: '°C',
  cropHealth: 82,
  cropHealthMax: 100,
  cropHealthStatus: 'Good / Moderate heat stress',
  expectedYield: 1420,
  yieldUnit: 'KG',
  humidity: 61,
  humidityUnit: '%',
  windSpeed: 14,
  windUnit: 'KM/H',
  cropStage: 'Flowering',
  uvIndex: 7,
  soilPh: 6.4,
};

export const weatherSimulationTelemetry = {
  soilMoisture: 36,
  soilStatus: 'Adequate moisture level',
  rainProbability: 85,
  rainForecast: 'High precipitation & storm advisory in 2h',
  temperature: 29,
  tempUnit: '°C',
  cropHealth: 80,
  cropHealthMax: 100,
  cropHealthStatus: 'Monitoring wind resistance',
  expectedYield: 1420,
  yieldUnit: 'KG',
  humidity: 82,
  humidityUnit: '%',
  windSpeed: 24,
  windUnit: 'KM/H',
  cropStage: 'Flowering',
  uvIndex: 3,
  soilPh: 6.4,
};

// ============================================
// Multi-Agent Architecture Data
// ============================================
export const defaultAgents = [
  {
    id: 'farmsense',
    name: 'FARMSENSE',
    phase: 'SENSE',
    role: 'Reads soil + weather conditions',
    question: 'Should we irrigate?',
    decision: 'DELAY IRRIGATION',
    detail: 'Rain probability: 78%',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'cropguard',
    name: 'CROPGUARD',
    phase: 'PREDICT',
    role: 'Predicts crop condition & yield',
    question: 'How is the crop condition?',
    decision: 'MODERATE STRESS',
    detail: 'Flowering stage heat resistance',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'marketmind',
    name: 'MARKETMIND',
    phase: 'MATCH',
    role: 'Matches harvest with demand',
    question: 'Where should harvest go?',
    decision: '90 KG SURPLUS',
    detail: '3 primary channels + rescue',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'actionflow',
    name: 'ACTIONFLOW',
    phase: 'ACT',
    role: 'Coordinates autonomous response',
    question: 'What is the coordinated action?',
    decision: 'PLAN GENERATED',
    detail: '4 coordinated instructions',
    status: 'ACTIVE',
    alert: false,
  },
];

export const weatherSimulationAgents = [
  {
    id: 'farmsense',
    name: 'FARMSENSE',
    phase: 'SENSE',
    role: 'Reads soil + weather conditions',
    question: 'Should we irrigate?',
    decision: 'DELAY IRRIGATION',
    detail: 'Rain probability: 85% — storm incoming',
    status: 'ACTIVE',
    alert: true,
  },
  {
    id: 'cropguard',
    name: 'CROPGUARD',
    phase: 'PREDICT',
    role: 'Predicts crop condition & yield',
    question: 'How is the crop condition?',
    decision: 'MONITOR WIND STRESS',
    detail: '24 km/h gust advisory on blooms',
    status: 'ACTIVE',
    alert: true,
  },
  {
    id: 'marketmind',
    name: 'MARKETMIND',
    phase: 'MATCH',
    role: 'Matches harvest with demand',
    question: 'Where should harvest go?',
    decision: '90 KG SURPLUS',
    detail: 'Harvest window safe in 5–7d',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'actionflow',
    name: 'ACTIONFLOW',
    phase: 'ACT',
    role: 'Coordinates autonomous response',
    question: 'What is the coordinated action?',
    decision: 'WEATHER RESPONSE PLAN',
    detail: '5 storm-adaptive instructions',
    status: 'ACTIVE',
    alert: true,
  },
];

export const marketSimulationAgents = [
  {
    id: 'farmsense',
    name: 'FARMSENSE',
    phase: 'SENSE',
    role: 'Reads soil + weather conditions',
    question: 'Should we irrigate?',
    decision: 'DELAY IRRIGATION',
    detail: 'Rain probability: 78%',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'cropguard',
    name: 'CROPGUARD',
    phase: 'PREDICT',
    role: 'Predicts crop condition & yield',
    question: 'How is the crop condition?',
    decision: 'MODERATE STRESS',
    detail: 'Yield estimate stable (1,420 kg)',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'marketmind',
    name: 'MARKETMIND',
    phase: 'MATCH',
    role: 'Matches harvest with demand',
    question: 'Where should harvest go?',
    decision: '250 KG SURPLUS DETECTED',
    detail: 'Wholesale demand shifted -260 kg',
    status: 'ACTIVE',
    alert: true,
  },
  {
    id: 'actionflow',
    name: 'ACTIONFLOW',
    phase: 'ACT',
    role: 'Coordinates autonomous response',
    question: 'What is the coordinated action?',
    decision: 'SURPLUS REDISTRIBUTION',
    detail: 'Rerouting 250 kg to rescue & NGO',
    status: 'ACTIVE',
    alert: true,
  },
];

// ============================================
// FarmFlow Decision (Action Plan)
// ============================================
export const defaultActionPlan = [
  {
    id: '01',
    title: 'DELAY IRRIGATION',
    impact: 'Save approx. 1,800 L water',
    context: 'Rain probability is 78% within next 6 hours; soil moisture at 27% will be replenished naturally.',
    priority: 'HIGH',
  },
  {
    id: '02',
    title: 'MONITOR CROP STRESS',
    impact: 'Moderate heat stress detected',
    context: 'Temperature peak at 34°C with flowering stage sensitivity; alert threshold set for foliar distress.',
    priority: 'MEDIUM',
  },
  {
    id: '03',
    title: 'PREPARE FOR HARVEST',
    impact: '5–7 day window opens',
    context: 'Ripening curve matches projected 1,420 kg target; staging logistics initiated for peak freshness.',
    priority: 'MEDIUM',
  },
  {
    id: '04',
    title: 'REDIRECT SURPLUS',
    impact: '90 KG → Food Rescue / NGO',
    context: 'Autonomous forward contract matched to prevent perishable spoilage before market saturation.',
    priority: 'HIGH',
  },
];

export const weatherSimulationActionPlan = [
  {
    id: '01',
    title: 'DELAY IRRIGATION',
    impact: 'Save approx. 2,400 L water',
    context: 'Storm front verified: 85% precipitation certainty. All automated valves locked off.',
    priority: 'HIGH',
  },
  {
    id: '02',
    title: 'SECURE CROP SUPPORTS',
    impact: 'Protect flowering canopy',
    context: 'Wind gusts exceeding 24 km/h; alert dispatched to inspect tomato trellis anchors on West plots.',
    priority: 'HIGH',
  },
  {
    id: '03',
    title: 'MONITOR CROP STRESS',
    impact: 'Wind stress active',
    context: 'Temperature dropped to 29°C; moisture surplus will require fungal surveillance post-storm.',
    priority: 'MEDIUM',
  },
  {
    id: '04',
    title: 'PREPARE FOR HARVEST',
    impact: '5–7 day window confirmed',
    context: 'Harvest timing adjusted around rainfall event to preserve fruit firmness.',
    priority: 'MEDIUM',
  },
  {
    id: '05',
    title: 'REDIRECT SURPLUS',
    impact: '90 KG → Food Rescue / NGO',
    context: 'Pre-harvest delivery contracts verified with regional cold chain storage.',
    priority: 'LOW',
  },
];

export const marketSimulationActionPlan = [
  {
    id: '01',
    title: 'DELAY IRRIGATION',
    impact: 'Save approx. 1,800 L water',
    context: '78% rain forecast holds; irrigation delay remains optimal.',
    priority: 'HIGH',
  },
  {
    id: '02',
    title: 'MONITOR CROP STRESS',
    impact: 'Moderate heat stress detected',
    context: 'Crop health stable at 82/100.',
    priority: 'MEDIUM',
  },
  {
    id: '03',
    title: 'REALLOCATE HARVEST',
    impact: '1,420 KG re-routed across 4 channels',
    context: 'Wholesale market demand contracted; automated dynamic matching triggered.',
    priority: 'HIGH',
  },
  {
    id: '04',
    title: 'EXPEDITE SURPLUS RESCUE',
    impact: '250 KG → Food Rescue & Community Kitchens',
    context: 'Autonomous instant allocation to certified zero-waste food partners and local NGO kitchens.',
    priority: 'HIGH',
  },
];

// ============================================
// Harvest Destination Distribution
// ============================================
export const defaultHarvestDestinations = {
  totalHarvest: 1420,
  unit: 'KG',
  channels: [
    {
      name: 'MARKETS',
      amount: 950,
      percentage: 67,
      description: 'Regional wholesale & direct retail outlets',
      color: '#315F38',
      type: 'commercial',
    },
    {
      name: 'RESTAURANTS',
      amount: 180,
      percentage: 13,
      description: 'Farm-to-table culinary partners',
      color: '#6F956B',
      type: 'commercial',
    },
    {
      name: 'FOOD RESCUE / NGO',
      amount: 290,
      percentage: 20,
      description: 'Zero-waste community recovery networks',
      color: '#C7A45A',
      type: 'rescue',
    },
  ],
};

export const marketSimulationHarvestDestinations = {
  totalHarvest: 1420,
  unit: 'KG',
  channels: [
    {
      name: 'MARKETS',
      amount: 690,
      percentage: 49,
      description: 'Adjusted primary market allotment',
      color: '#315F38',
      type: 'commercial',
    },
    {
      name: 'RESTAURANTS',
      amount: 180,
      percentage: 13,
      description: 'Fixed culinary partner quotas',
      color: '#6F956B',
      type: 'commercial',
    },
    {
      name: 'FOOD RESCUE / NGO',
      amount: 400,
      percentage: 28,
      description: 'Expanded cold-bank food rescue',
      color: '#C7A45A',
      type: 'rescue',
    },
    {
      name: 'COMMUNITY KITCHENS',
      amount: 150,
      percentage: 10,
      description: 'Direct institutional nutritional redistribution',
      color: '#8F753E',
      type: 'rescue',
    },
  ],
};

// ============================================
// Measured Impact Metrics
// ============================================
export const defaultImpactMetrics = {
  primary: [
    {
      id: 'water',
      value: '1,800',
      unit: 'L',
      label: 'WATER SAVED',
      description: 'Smart irrigation deferral based on verified rain forecast',
      highlight: false,
    },
    {
      id: 'food',
      value: '290',
      unit: 'KG',
      label: 'FOOD RESCUED',
      description: 'Zero-waste harvest matching to food rescue & NGO partners',
      highlight: true,
    },
    {
      id: 'economic',
      value: '₹11,600',
      unit: '',
      label: 'VALUE RECOVERED',
      description: 'Economic value preserved through dynamic harvest allocation',
      highlight: true,
    },
    {
      id: 'carbon',
      value: '87',
      unit: 'KG',
      label: 'CO₂e AVERTED*',
      description: 'Emissions prevented via diverted organic decomposition',
      highlight: false,
    },
  ],
  secondary: [
    {
      id: 'yield',
      value: '+8%',
      label: 'YIELD GAIN',
      detail: 'Precision stress mitigation',
    },
    {
      id: 'fertilizer',
      value: '6%',
      label: 'FERTILIZER REDUCTION',
      detail: 'Runoff prevention timing',
    },
  ],
  disclaimer: '*ESTIMATED FROM SIMULATED SCENARIO',
};

export const weatherSimulationImpactMetrics = {
  primary: [
    {
      id: 'water',
      value: '2,400',
      unit: 'L',
      label: 'WATER SAVED',
      description: 'Extended irrigation deferral through verified storm precipitation',
      highlight: true,
    },
    {
      id: 'food',
      value: '290',
      unit: 'KG',
      label: 'FOOD RESCUED',
      description: 'Zero-waste harvest matching preserved',
      highlight: false,
    },
    {
      id: 'economic',
      value: '₹14,200',
      unit: '',
      label: 'VALUE RECOVERED',
      description: 'Water & energy input costs conserved + crop protection',
      highlight: true,
    },
    {
      id: 'carbon',
      value: '104',
      unit: 'KG',
      label: 'CO₂e AVERTED*',
      description: 'Pumping energy reduction + preserved organic biomass',
      highlight: false,
    },
  ],
  secondary: [
    {
      id: 'yield',
      value: '+8%',
      label: 'YIELD GAIN',
      detail: 'Protected from storm damage',
    },
    {
      id: 'fertilizer',
      value: '6%',
      label: 'FERTILIZER REDUCTION',
      detail: 'Zero leaching runoff',
    },
  ],
  disclaimer: '*ESTIMATED FROM SIMULATED SCENARIO',
};

export const marketSimulationImpactMetrics = {
  primary: [
    {
      id: 'water',
      value: '1,800',
      unit: 'L',
      label: 'WATER SAVED',
      description: 'Smart irrigation deferral maintained',
      highlight: false,
    },
    {
      id: 'food',
      value: '480',
      unit: 'KG',
      label: 'FOOD RESCUED',
      description: 'Redirected 250 kg extra surplus directly to human consumption',
      highlight: true,
    },
    {
      id: 'economic',
      value: '₹18,400',
      unit: '',
      label: 'VALUE RECOVERED',
      description: 'Full harvest monetization & social tax-credit offsets',
      highlight: true,
    },
    {
      id: 'carbon',
      value: '142',
      unit: 'KG',
      label: 'CO₂e AVERTED*',
      description: 'Maximum landfill methane prevention from surplus produce',
      highlight: true,
    },
  ],
  secondary: [
    {
      id: 'yield',
      value: '+8%',
      label: 'YIELD GAIN',
      detail: 'Precision stress mitigation',
    },
    {
      id: 'fertilizer',
      value: '6%',
      label: 'FERTILIZER REDUCTION',
      detail: 'Runoff prevention timing',
    },
  ],
  disclaimer: '*ESTIMATED FROM SIMULATED SCENARIO',
};

// ============================================
// Intelligence Stream (Operational Log)
// ============================================
export const defaultIntelligenceStream = [
  {
    id: 'log-01',
    time: '09:41',
    agent: 'FARMSENSE',
    event: 'Rain probability updated → 78%',
    level: 'INFO',
  },
  {
    id: 'log-02',
    time: '09:41',
    agent: 'FARMSENSE',
    event: 'Irrigation recommendation → DELAY (Save 1,800 L)',
    level: 'ACTION',
  },
  {
    id: 'log-03',
    time: '09:42',
    agent: 'CROPGUARD',
    event: 'Expected yield evaluated → 1,420 KG (Health: 82/100)',
    level: 'UPDATE',
  },
  {
    id: 'log-04',
    time: '09:42',
    agent: 'MARKETMIND',
    event: 'Surplus detected → 90 KG forwarded to food recovery channels',
    level: 'ALERT',
  },
  {
    id: 'log-05',
    time: '09:43',
    agent: 'ACTIONFLOW',
    event: 'Coordinated autonomous decision plan generated & active',
    level: 'ACTION',
  },
];

export const weatherSimulationStreamEvents = [
  {
    id: 'log-w1',
    time: '09:44',
    agent: 'FARMSENSE',
    event: 'Weather alert: Rain probability escalated 78% → 85%',
    level: 'ALERT',
  },
  {
    id: 'log-w2',
    time: '09:44',
    agent: 'FARMSENSE',
    event: 'Wind gust velocity increased to 24 KM/H',
    level: 'ALERT',
  },
  {
    id: 'log-w3',
    time: '09:44',
    agent: 'CROPGUARD',
    event: 'Wind stress surveillance triggered on flowering tomato plots',
    level: 'UPDATE',
  },
  {
    id: 'log-w4',
    time: '09:45',
    agent: 'ACTIONFLOW',
    event: 'Storm response protocol generated: Irrigation locked, water saved → 2,400 L',
    level: 'ACTION',
  },
];

export const marketSimulationStreamEvents = [
  {
    id: 'log-m1',
    time: '09:46',
    agent: 'MARKETMIND',
    event: 'Market demand shifted: Primary wholesale quota down 260 KG',
    level: 'ALERT',
  },
  {
    id: 'log-m2',
    time: '09:46',
    agent: 'MARKETMIND',
    event: 'Total perishable surplus increased 90 KG → 250 KG',
    level: 'ALERT',
  },
  {
    id: 'log-m3',
    time: '09:47',
    agent: 'ACTIONFLOW',
    event: 'Dynamic redistribution: 250 KG matched with certified rescue partners',
    level: 'ACTION',
  },
  {
    id: 'log-m4',
    time: '09:47',
    agent: 'ACTIONFLOW',
    event: 'Zero-waste verification: Value recovered updated to ₹18,400',
    level: 'UPDATE',
  },
];
