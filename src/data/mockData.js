/**
 * FarmFlow AI — Autonomous Farm-to-Market Intelligence
 * Centralized Field Profile & Telemetry Abstraction Definitions
 *
 * Location: Thanjavur, Tamil Nadu, India (Cauvery Delta Region)
 * Crop: Paddy / Rice (Variety: Ponni Samba)
 *
 * NOTE: The CSV dataset is solely used for training CropGuard's ML model.
 * Live farm displays use the telemetry abstraction layer defined below.
 */

// ============================================
// 1. Field Profile Data
// ============================================
export const initialFarmProfile = {
  name: 'THANJAVUR PADDY FIELD',
  crop: 'Rice',
  cropDisplay: 'Paddy / Rice',
  variety: 'Ponni Samba',
  acreage: 10,
  location: 'Thanjavur, Tamil Nadu, India',
  regionContext: 'Cauvery Delta',
  stage: 'Vegetative',
  stageDetail: 'Tillering Stage',
  systemStatus: 'ACTIVE',
  mode: 'FIELD TELEMETRY SNAPSHOT',
};

// ============================================
// 2. Telemetry Abstraction (Default Baseline)
// ============================================
export const fieldTelemetry = {
  location: 'Thanjavur, Tamil Nadu, India (Cauvery Delta)',
  crop: 'Rice',
  cropStage: 'Vegetative',
  variety: 'Ponni Samba',
  acreage: 10,
  temperature: 32,
  tempUnit: '°C',
  humidity: 72,
  humidityUnit: '%',
  soilMoisture: 28,
  soilStatus: 'Low soil moisture (28%)',
  rainProbability: 85,
  rainForecast: 'High monsoon rain probability (85%) in Cauvery delta',
  windSpeed: 12,
  windUnit: 'KM/H',
  cropHealth: 92,
  cropHealthMax: 100,
  cropHealthStatus: 'Moderate stress — needs water soon',
  expectedYield: 11758.5,
  yieldUnit: 'KG',
  marketDemand: 4500,
  source: 'DEMO_TELEMETRY_SNAPSHOT',
  timestamp: new Date().toISOString(),
  status: 'ACTIVE_TELEMETRY_SNAPSHOT',
  uvIndex: 6,
  soilPh: 6.8,
};

// Alias for backwards compatibility with dashboard imports
export const defaultTelemetry = fieldTelemetry;

// ============================================
// Telemetry Scenario: Delta Weather Event
// ============================================
export const weatherSimulationTelemetry = {
  ...fieldTelemetry,
  soilMoisture: 58,
  soilStatus: 'High moisture / Standing water monitored in plots',
  rainProbability: 95,
  rainForecast: 'Heavy monsoon precipitation in Cauvery Delta in 3h',
  temperature: 28,
  humidity: 88,
  windSpeed: 26,
  cropHealth: 88,
  cropHealthStatus: 'Monitoring drainage & lodging risk',
  expectedYield: 11758.5,
  marketDemand: 4500,
  uvIndex: 2,
};

// ============================================
// Telemetry Scenario: Market Demand Shift
// ============================================
export const marketSimulationTelemetry = {
  ...fieldTelemetry,
  marketDemand: 2800,
  expectedYield: 11758.5,
};

// ============================================
// 3. Multi-Agent Architecture Data
// ============================================
export const defaultAgents = [
  {
    id: 'farmsense',
    name: 'FARMSENSE',
    tamilName: 'நிலம்',
    phase: 'SENSE',
    role: 'Reads Cauvery delta soil + weather telemetry',
    question: 'Should we irrigate the paddy field?',
    decision: 'Soil moisture is low.',
    detail: '28% SOIL',
    status: 'ACTIVE',
    alert: true,
  },
  {
    id: 'cropguard',
    name: 'CROPGUARD',
    tamilName: 'வளம்',
    phase: 'PREDICT',
    role: 'ML yield prediction & paddy vigor monitoring',
    question: 'How is the crop health & yield?',
    decision: '11,758.5 KG EXPECTED • Crop needs water soon.',
    detail: 'MODERATE STRESS',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'marketmind',
    name: 'MARKETMIND',
    tamilName: 'சந்தை',
    phase: 'MATCH',
    role: 'Matches paddy harvest against regional demand',
    question: 'Where should harvest go?',
    decision: '₹1,99,732 AT RISK',
    detail: '4,728.5 KG SURPLUS',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'actionflow',
    name: 'ACTIONFLOW',
    tamilName: 'செயல்',
    phase: 'ACT',
    role: 'Coordinates unified delta farm response',
    question: 'What is the coordinated action?',
    decision: 'Rain is likely soon, so irrigation can wait and water can be saved.',
    detail: 'DELAY IRRIGATION',
    status: 'ACTIVE',
    alert: true,
  },
];

export const weatherSimulationAgents = [
  {
    id: 'farmsense',
    name: 'FARMSENSE',
    tamilName: 'நிலம்',
    phase: 'SENSE',
    role: 'Reads Cauvery delta soil + weather telemetry',
    question: 'Should we irrigate?',
    decision: 'DELAY IRRIGATION',
    detail: 'Rain probability: 85% — delta monsoon incoming',
    status: 'ACTIVE',
    alert: true,
  },
  {
    id: 'cropguard',
    name: 'CROPGUARD',
    tamilName: 'வளம்',
    phase: 'PREDICT',
    role: 'ML yield prediction & paddy vigor monitoring',
    question: 'How is the crop condition?',
    decision: 'MONITOR DRAINAGE',
    detail: 'Standing water monitoring on vegetative plots',
    status: 'ACTIVE',
    alert: true,
  },
  {
    id: 'marketmind',
    name: 'MARKETMIND',
    tamilName: 'சந்தை',
    phase: 'MATCH',
    role: 'Matches paddy harvest against regional demand',
    question: 'Where should harvest go?',
    decision: '700 KG SURPLUS',
    detail: 'Grain logistics safe • Delivery scheduled',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'actionflow',
    name: 'ACTIONFLOW',
    tamilName: 'செயல்',
    phase: 'ACT',
    role: 'Coordinates unified delta farm response',
    question: 'What is the coordinated action?',
    decision: 'MONSOON PROTOCOL',
    detail: 'Irrigation delay + field drainage verification',
    status: 'ACTIVE',
    alert: true,
  },
];

export const marketSimulationAgents = [
  {
    id: 'farmsense',
    name: 'FARMSENSE',
    tamilName: 'நிலம்',
    phase: 'SENSE',
    role: 'Reads Cauvery delta soil + weather telemetry',
    question: 'Should we irrigate?',
    decision: 'NO_ACTION',
    detail: 'Moisture optimal (42%)',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'cropguard',
    name: 'CROPGUARD',
    tamilName: 'வளம்',
    phase: 'PREDICT',
    role: 'ML yield prediction & paddy vigor monitoring',
    question: 'How is the crop condition?',
    decision: 'LOW STRESS',
    detail: 'Yield estimate: 5,200 KG',
    status: 'ACTIVE',
    alert: false,
  },
  {
    id: 'marketmind',
    name: 'MARKETMIND',
    tamilName: 'சந்தை',
    phase: 'MATCH',
    role: 'Matches paddy harvest against regional demand',
    question: 'Where should harvest go?',
    decision: '2,400 KG SURPLUS',
    detail: 'Local mandi demand down to 2,800 KG',
    status: 'ACTIVE',
    alert: true,
  },
  {
    id: 'actionflow',
    name: 'ACTIONFLOW',
    tamilName: 'செயல்',
    phase: 'ACT',
    role: 'Coordinates unified delta farm response',
    question: 'What is the coordinated action?',
    decision: 'EXPEDITE SURPLUS ROUTING',
    detail: 'Reallocating 2,400 KG to state civil supplies & NGO food banks',
    status: 'ACTIVE',
    alert: true,
  },
];

// ============================================
// 4. FarmFlow Decisions (Action Plans)
// ============================================
export const defaultActionPlan = [
  {
    id: '01',
    title: 'DELAY IRRIGATION → WAIT FOR RAIN',
    impact: 'Rain is likely soon (85% chance). Delaying irrigation saves 2,100 L of water.',
    context: 'Soil moisture is low at 28%, but high precipitation probability (85%) makes immediate irrigation redundant.',
    priority: 'HIGH',
    source_agents: ['FARMSENSE', 'ACTIONFLOW'],
  },
  {
    id: '02',
    title: 'MONITOR CROP STRESS',
    impact: 'Moderate stress detected at 28% soil moisture; rain expected within 12h.',
    context: 'Crop health index at 92/100 with 11,758.5 KG projected harvest; monitor tillering stand during rain arrival.',
    priority: 'MEDIUM',
    source_agents: ['CROPGUARD'],
  },
  {
    id: '03',
    title: 'MONITOR DISEASE RISK',
    impact: 'High ambient humidity (72%) during post-rain period requires preventive leaf inspection.',
    context: 'Pre-harvest surplus of 4,728.5 KG tracked for regional mandi and food bank allocation.',
    priority: 'MEDIUM',
    source_agents: ['MARKETMIND', 'CROPGUARD'],
  },
];

export const weatherSimulationActionPlan = [
  {
    id: '01',
    title: 'LOCK CANAL IRRIGATION INFLOW',
    impact: 'Save approx. 2,400 L canal pumping',
    context: 'Delta monsoon rain front incoming: 85% precipitation probability within 3h; inlet sluice gates locked.',
    priority: 'HIGH',
    source_agents: ['FARMSENSE'],
  },
  {
    id: '02',
    title: 'INSPECT FIELD DRAINAGE OUTLETS',
    impact: 'Prevent localized field waterlogging',
    context: 'High precipitation forecast; ensure paddy plot bunds allow excess runoff into designated drainage channels.',
    priority: 'HIGH',
    source_agents: ['CROPGUARD', 'FARMSENSE'],
  },
  {
    id: '03',
    title: 'MONITOR CROP LODGING RISK',
    impact: 'Wind velocity at 26 KM/H',
    context: 'Monitor vegetative tillering stands for wind resistance during rainfall event.',
    priority: 'MEDIUM',
    source_agents: ['CROPGUARD'],
  },
  {
    id: '04',
    title: 'VERIFY GRAIN WAREHOUSE STORAGE',
    impact: 'Protect 5,200 KG harvest readiness',
    context: 'Ensure regional Thanjavur grain storage facilities maintain dry humidity standards.',
    priority: 'LOW',
    source_agents: ['MARKETMIND'],
  },
];

export const marketSimulationActionPlan = [
  {
    id: '01',
    title: 'EXPEDITE SURPLUS RESCUE ROUTING',
    impact: '2,400 KG → State Civil Supplies & Food Bank Networks',
    context: 'Primary commercial mandi demand dropped to 2,800 KG; automated allocation routes 2,400 KG paddy surplus to direct institutional procurement (₹1,08,000 preserved).',
    priority: 'HIGH',
    source_agents: ['MARKETMIND', 'CROPGUARD'],
  },
  {
    id: '02',
    title: 'MAINTAIN TILLERING WATER MANAGEMENT',
    impact: 'Optimal soil moisture at 42%',
    context: 'Soil moisture stable; continue standard water management.',
    priority: 'MEDIUM',
    source_agents: ['FARMSENSE'],
  },
  {
    id: '03',
    title: 'LOGISTICS DISPATCH CONFIRMATION',
    impact: '2,800 KG → Thanjavur Wholesale Mandi',
    context: 'Primary commercial quota locked with confirmed transport trucks.',
    priority: 'MEDIUM',
    source_agents: ['MARKETMIND'],
  },
];

// ============================================
// 5. Harvest Destination Distribution (Paddy Rice)
// ============================================
export const defaultHarvestDestinations = {
  totalHarvest: 5200,
  unit: 'KG',
  channels: [
    {
      name: 'THANJAVUR WHOLESALE MANDI',
      amount: 4500,
      percentage: 86.5,
      description: 'Primary commercial grain mandi procurement',
      color: '#315F38',
      type: 'commercial',
    },
    {
      name: 'TN CIVIL SUPPLIES & FOOD RESCUE',
      amount: 700,
      percentage: 13.5,
      description: 'State procurement & community grain banks',
      color: '#C7A45A',
      type: 'rescue',
    },
  ],
};

export const marketSimulationHarvestDestinations = {
  totalHarvest: 5200,
  unit: 'KG',
  channels: [
    {
      name: 'THANJAVUR WHOLESALE MANDI',
      amount: 2800,
      percentage: 53.8,
      description: 'Adjusted primary commercial quota',
      color: '#315F38',
      type: 'commercial',
    },
    {
      name: 'TN CIVIL SUPPLIES CORPORATION',
      amount: 1800,
      percentage: 34.6,
      description: 'Direct institutional grain procurement',
      color: '#C7A45A',
      type: 'rescue',
    },
    {
      name: 'COMMUNITY FOOD RESCUE / NGOS',
      amount: 600,
      percentage: 11.6,
      description: 'Zero-waste local food bank network',
      color: '#8F753E',
      type: 'rescue',
    },
  ],
};

// ============================================
// 6. Measured Impact Metrics
// ============================================
export const defaultImpactMetrics = {
  primary: [
    {
      id: 'water',
      value: '2,100',
      unit: 'L',
      label: 'WATER CONSERVED',
      description: 'Smart canal irrigation management based on delta soil moisture & rain telemetry',
      highlight: false,
    },
    {
      id: 'food',
      value: '700',
      unit: 'KG',
      label: 'GRAIN RESCUED / MATCHED',
      description: 'Zero-waste harvest matching to state procurement & food banks',
      highlight: true,
    },
    {
      id: 'economic',
      value: '₹31,500',
      unit: '',
      label: 'ECONOMIC VALUE PRESERVED',
      description: 'Economic value protected via dynamic surplus routing @ ₹45/kg paddy price',
      highlight: true,
    },
    {
      id: 'carbon',
      value: '210',
      unit: 'KG',
      label: 'CO₂e AVERTED*',
      description: 'Emissions prevented via diverted organic loss & pump conservation',
      highlight: false,
    },
  ],
  secondary: [
    {
      id: 'yield',
      value: '+9%',
      label: 'YIELD GAIN',
      detail: 'Precision tillering water control',
    },
    {
      id: 'fertilizer',
      value: '8%',
      label: 'NUTRIENT RETENTION',
      detail: 'Runoff prevention timing in delta',
    },
  ],
  disclaimer: '*ESTIMATED FROM THANJAVUR DELTA FIELD SNAPSHOT',
};

export const weatherSimulationImpactMetrics = {
  primary: [
    {
      id: 'water',
      value: '3,200',
      unit: 'L',
      label: 'WATER CONSERVED',
      description: 'Inlet sluice lock during verified delta monsoon storm',
      highlight: true,
    },
    {
      id: 'food',
      value: '700',
      unit: 'KG',
      label: 'GRAIN PROTECTED',
      description: 'Zero-waste harvest matching secured',
      highlight: false,
    },
    {
      id: 'economic',
      value: '₹42,000',
      unit: '',
      label: 'VALUE RECOVERED',
      description: 'Pumping energy conserved + lodging damage prevention',
      highlight: true,
    },
    {
      id: 'carbon',
      value: '320',
      unit: 'KG',
      label: 'CO₂e AVERTED*',
      description: 'Pumping energy reduction + crop preservation',
      highlight: false,
    },
  ],
  secondary: [
    {
      id: 'yield',
      value: '+9%',
      label: 'YIELD GAIN',
      detail: 'Protected from storm waterlogging',
    },
    {
      id: 'fertilizer',
      value: '10%',
      label: 'NUTRIENT RETENTION',
      detail: 'Zero leaching runoff in delta',
    },
  ],
  disclaimer: '*ESTIMATED FROM THANJAVUR DELTA FIELD SNAPSHOT',
};

export const marketSimulationImpactMetrics = {
  primary: [
    {
      id: 'water',
      value: '2,100',
      unit: 'L',
      label: 'WATER CONSERVED',
      description: 'Standard tillering water management maintained',
      highlight: false,
    },
    {
      id: 'food',
      value: '2,400',
      unit: 'KG',
      label: 'GRAIN RESCUED',
      description: 'Redirected 2,400 kg surplus paddy directly to state food security channels',
      highlight: true,
    },
    {
      id: 'economic',
      value: '₹1,08,000',
      unit: '',
      label: 'VALUE PRESERVED',
      description: 'Full harvest monetization @ ₹45/kg paddy price via TN Civil Supplies',
      highlight: true,
    },
    {
      id: 'carbon',
      value: '720',
      unit: 'KG',
      label: 'CO₂e AVERTED*',
      description: 'Maximum post-harvest decomposition prevention',
      highlight: true,
    },
  ],
  secondary: [
    {
      id: 'yield',
      value: '+9%',
      label: 'YIELD GAIN',
      detail: 'Precision stress mitigation',
    },
    {
      id: 'fertilizer',
      value: '8%',
      label: 'NUTRIENT RETENTION',
      detail: 'Runoff prevention timing',
    },
  ],
  disclaimer: '*ESTIMATED FROM THANJAVUR DELTA FIELD SNAPSHOT',
};

// ============================================
// 7. Intelligence Stream (Operational Log)
// ============================================
export const defaultIntelligenceStream = [
  {
    id: 'log-01',
    time: '09:41',
    agent: 'FARMSENSE',
    tamilName: 'நிலம்',
    event: 'Soil moisture evaluated at 42% → Tillering depth optimal',
    level: 'INFO',
  },
  {
    id: 'log-02',
    time: '09:41',
    agent: 'FARMSENSE',
    tamilName: 'நிலம்',
    event: 'Canal irrigation recommendation → NO_ACTION (Conserving 2,100 L)',
    level: 'ACTION',
  },
  {
    id: 'log-03',
    time: '09:42',
    agent: 'CROPGUARD',
    tamilName: 'வளம்',
    event: 'ML Yield prediction → 5,200 KG Rice (Health: 92/100 • LOW stress)',
    level: 'UPDATE',
  },
  {
    id: 'log-04',
    time: '09:42',
    agent: 'MARKETMIND',
    tamilName: 'சந்தை',
    event: 'Demand matched → 4,500 KG Mandi • 700 KG Surplus routed to State Procurement',
    level: 'ALERT',
  },
  {
    id: 'log-05',
    time: '09:43',
    agent: 'ACTIONFLOW',
    tamilName: 'செயல்',
    event: 'Coordinated Thanjavur paddy action plan active (3 instructions)',
    level: 'ACTION',
  },
];

export const weatherSimulationStreamEvents = [
  {
    id: 'log-w1',
    time: '09:44',
    agent: 'FARMSENSE',
    tamilName: 'நிலம்',
    event: 'Delta weather alert: Rain probability escalated 25% → 85%',
    level: 'ALERT',
  },
  {
    id: 'log-w2',
    time: '09:44',
    agent: 'FARMSENSE',
    tamilName: 'நிலம்',
    event: 'Wind velocity increased to 26 KM/H in Cauvery Delta basin',
    level: 'ALERT',
  },
  {
    id: 'log-w3',
    time: '09:44',
    agent: 'CROPGUARD',
    tamilName: 'வளம்',
    event: 'Drainage surveillance triggered on vegetative paddy plots',
    level: 'UPDATE',
  },
  {
    id: 'log-w4',
    time: '09:45',
    agent: 'ACTIONFLOW',
    tamilName: 'செயல்',
    event: 'Monsoon protocol active: Canal inlets locked, water saved → 3,200 L',
    level: 'ACTION',
  },
];

export const marketSimulationStreamEvents = [
  {
    id: 'log-m1',
    time: '09:46',
    agent: 'MARKETMIND',
    tamilName: 'சந்தை',
    event: 'Mandi demand shift: Wholesale quota down to 2,800 KG',
    level: 'ALERT',
  },
  {
    id: 'log-m2',
    time: '09:46',
    agent: 'MARKETMIND',
    tamilName: 'சந்தை',
    event: 'Paddy surplus increased 700 KG → 2,400 KG',
    level: 'ALERT',
  },
  {
    id: 'log-m3',
    time: '09:47',
    agent: 'ACTIONFLOW',
    tamilName: 'செயல்',
    event: 'Dynamic redistribution: 2,400 KG matched with TN Civil Supplies & NGOs',
    level: 'ACTION',
  },
  {
    id: 'log-m4',
    time: '09:47',
    agent: 'ACTIONFLOW',
    tamilName: 'செயல்',
    event: 'Zero-waste verification: Value preserved updated to ₹1,08,000',
    level: 'UPDATE',
  },
];
