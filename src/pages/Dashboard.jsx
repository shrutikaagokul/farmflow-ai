import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import FieldBackground from '../components/FieldBackground';
import {
  fieldTelemetry,
  weatherSimulationTelemetry,
  marketSimulationTelemetry,
  defaultAgents,
  weatherSimulationAgents,
  marketSimulationAgents,
  defaultActionPlan,
  weatherSimulationActionPlan,
  marketSimulationActionPlan,
} from '../data/mockData';



function AuthWelcome() {
  const { isAuthenticated, user, isDemo } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <div className="mb-2 flex items-center gap-3 font-mono text-xs">
      <span className={`w-2 h-2 rounded-full ${user?.role === 'fpo' ? 'bg-[#6F956B]' : 'bg-[#C7A45A]'}`} />
      <span className="text-[#9A9D91] tracking-wider uppercase">
        Welcome, <strong className="text-[#E8E3D5]">{user?.name || 'User'}</strong>
      </span>
      {isDemo && (
        <span className="px-2 py-0.5 bg-[#C7A45A]/20 text-[#C7A45A] text-[9px] tracking-wider rounded-sm uppercase">
          Demo Mode
        </span>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [activeScenario, setActiveScenario] = useState('default');
  const [telemetry, setTelemetry] = useState(fieldTelemetry);
  const [agents, setAgents] = useState(defaultAgents);
  const [actionPlan, setActionPlan] = useState(defaultActionPlan);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [livePipeline, setLivePipeline] = useState(null);

  // Read persisted Buyer Demand in KG
  const savedDemandKg = localStorage.getItem('farmflow_buyer_demand_kg') || localStorage.getItem('farmflow_buyer_demand');
  let currentDemandKg = 4500;
  if (savedDemandKg !== null) {
    const parsed = Number(savedDemandKg);
    currentDemandKg = parsed <= 100 ? Math.round(1000 + (parsed / 100) * 9000) : parsed;
  }

  const [pipelineHealth, setPipelineHealth] = useState({
    online_agents: 4,
    total_agents: 4,
    status: 'ALL_ONLINE',
  });

  const [agentStatuses, setAgentStatuses] = useState({
    farmsense: { status: 'COMPLETED', error: null, message: 'Field conditions analyzed' },
    cropguard: { status: 'COMPLETED', error: null, message: 'Yield predicted' },
    marketmind: { status: 'COMPLETED', error: null, message: 'Demand matched' },
    actionflow: { status: 'DECISION_READY', error: null, message: 'Action plan generated' },
  });

  // Query Real Backend 4-Agent Pipeline
  const fetchLiveAgentPipeline = async (currentTelemetry) => {
    try {
      const payload = {
        temperature: Number(currentTelemetry.temperature),
        humidity: Number(currentTelemetry.humidity),
        soil_moisture: Number(currentTelemetry.soilMoisture),
        rain_probability: Number(currentTelemetry.rainProbability),
        wind_speed: Number(currentTelemetry.windSpeed),
        crop: currentTelemetry.crop || 'Rice',
        crop_stage: currentTelemetry.cropStage || 'Vegetative',
        market_demand: currentDemandKg,
      };

      let res = await fetch('/api/actionflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('http://localhost:8000/api/actionflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setIsBackendConnected(true);
        setLivePipeline(data.pipeline);
        const p = data.pipeline;
        const af = data.actionflow;

        if (data.pipeline_health) {
          setPipelineHealth(data.pipeline_health);
        }
        if (data.agent_statuses) {
          setAgentStatuses(data.agent_statuses);
        }

        const fsStatus = data.agent_statuses?.farmsense?.status || 'COMPLETED';
        const cgStatus = data.agent_statuses?.cropguard?.status || 'COMPLETED';
        const mmStatus = data.agent_statuses?.marketmind?.status || 'COMPLETED';
        const afStatus = data.agent_statuses?.actionflow?.status || 'DECISION_READY';

        setAgents([
          {
            id: 'farmsense',
            name: 'FARMSENSE',
            tamilName: 'நிலம்',
            phase: 'SENSE',
            status: fsStatus,
            mainMetric: fsStatus === 'FAILED' ? 'ERROR' : fsStatus === 'WAITING' ? 'WAITING' : `${p.farmsense?.telemetry_summary?.soil_moisture || currentTelemetry.soilMoisture}% SOIL`,
            decision: fsStatus === 'FAILED' ? 'Unable to evaluate' : fsStatus === 'WAITING' ? 'Waiting for FarmSense' : p.farmsense?.irrigation_decision === 'DELAY' ? `DELAY (${p.farmsense?.delay_hours}H)` : p.farmsense?.irrigation_decision,
          },
          {
            id: 'cropguard',
            name: 'CROPGUARD',
            tamilName: 'வளம்',
            phase: 'PREDICT',
            status: cgStatus,
            mainMetric: cgStatus === 'FAILED' ? 'ERROR' : cgStatus === 'WAITING' ? 'WAITING' : `${p.cropguard?.stress_level} STRESS`,
            decision: cgStatus === 'FAILED' ? 'Yield prediction unavailable' : cgStatus === 'WAITING' ? 'Waiting for CropGuard' : `${p.cropguard?.expected_yield_kg?.toLocaleString()} KG YIELD`,
          },
          {
            id: 'marketmind',
            name: 'MARKETMIND',
            tamilName: 'சந்தை',
            phase: 'MATCH',
            status: mmStatus,
            mainMetric: mmStatus === 'FAILED' ? 'ERROR' : mmStatus === 'WAITING' ? 'WAITING' : (p.marketmind?.surplus_kg > 0 ? `${p.marketmind?.surplus_kg?.toLocaleString()} KG SURPLUS` : 'BALANCED DEMAND'),
            decision: mmStatus === 'FAILED' ? 'Matching unavailable' : mmStatus === 'WAITING' ? 'Waiting for MarketMind' : (p.marketmind?.economic_value_at_risk_inr > 0 ? `₹${p.marketmind?.economic_value_at_risk_inr?.toLocaleString()} AT RISK` : `₹${p.marketmind?.economic_value_recovered_inr?.toLocaleString()} RECOVERED`),
          },
          {
            id: 'actionflow',
            name: 'ACTIONFLOW',
            tamilName: 'செயல்',
            phase: 'ACT',
            status: afStatus,
            mainMetric: afStatus === 'FAILED' ? 'ERROR' : afStatus === 'WAITING' ? 'PAUSED' : `${af.priority_actions?.length || 1} PRIORITY ACTION${(af.priority_actions?.length || 1) > 1 ? 'S' : ''}`,
            decision: afStatus === 'FAILED' ? 'Unable to generate action plan' : afStatus === 'WAITING' ? 'Decision paused' : 'DECISION READY',
          },
        ]);

        if (af.priority_actions && af.priority_actions.length > 0) {
          setActionPlan(af.priority_actions.map((act, i) => ({
            id: `0${act.priority || i + 1}`,
            title: act.title,
            impact: act.impact || act.reason,
            priority: act.urgency || 'MEDIUM',
          })));
        }
      }
    } catch (e) {
      console.warn('Live backend query info:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {
        await fetchLiveAgentPipeline(fieldTelemetry);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSimulateWeather = () => {
    setActiveScenario('weather');
    setTelemetry(weatherSimulationTelemetry);
    setAgents(weatherSimulationAgents);
    setActionPlan(weatherSimulationActionPlan);
    fetchLiveAgentPipeline(weatherSimulationTelemetry);
  };

  const handleSimulateMarket = () => {
    setActiveScenario('market');
    setTelemetry(marketSimulationTelemetry);
    setAgents(marketSimulationAgents);
    setActionPlan(marketSimulationActionPlan);
    fetchLiveAgentPipeline(marketSimulationTelemetry);
  };

  const handleResetScenario = () => {
    setActiveScenario('default');
    setTelemetry(fieldTelemetry);
    setAgents(defaultAgents);
    setActionPlan(defaultActionPlan);
    fetchLiveAgentPipeline(fieldTelemetry);
  };



  return (
    <div className="min-h-screen bg-[#080B08] text-[#E8E3D5] relative selection:bg-[#315F38]/40 selection:text-[#E8E3D5]">
      <FieldBackground />
      <Navigation />

      <main className="relative z-10 pt-20 md:pt-24 pb-24 max-w-[1360px] mx-auto px-6 md:px-12 space-y-12">
        
        <AuthWelcome />

        {/* Top Context Line */}
        <div className="py-2.5 px-5 bg-[#101510] border border-[#1A241B] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6F956B] animate-pulse" />
              <span className="font-bold text-[#E8E3D5] tracking-wider uppercase">■ THANJAVUR DELTA</span>
            </div>
            <span className="text-[#1A241B] hidden sm:inline">•</span>
            <span className="text-[#9A9D91]">
              <strong className="text-[#E8E3D5]">{telemetry.crop || 'Rice'}</strong> · {telemetry.cropStage || 'Vegetative'}
            </span>
            <span className="text-[#1A241B] hidden sm:inline">•</span>
            <span className="text-[#9A9D91]">
              Soil <strong className="text-[#E8E3D5]">{telemetry.soilMoisture}%</strong>
            </span>
            <span className="text-[#1A241B] hidden sm:inline">•</span>
            <span className="text-[#9A9D91]">
              Rain <strong className="text-[#6F956B]">{telemetry.rainProbability}%</strong>
            </span>
            <span className="text-[#1A241B] hidden sm:inline">•</span>
            <span className="text-[#9A9D91]">
              DEMAND <strong className="text-[#C7A45A]">{currentDemandKg.toLocaleString()} KG</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Scenario Toggles */}
            <div className="hidden sm:flex items-center gap-2 text-[10px]">
              <button
                onClick={handleSimulateWeather}
                className={`px-2.5 py-1 border transition-all cursor-pointer uppercase ${
                  activeScenario === 'weather' ? 'bg-[#102B18] border-[#6F956B] text-[#E8E3D5]' : 'bg-[#080B08] border-[#1A241B] text-[#9A9D91] hover:text-[#E8E3D5]'
                }`}
              >
                Storm
              </button>
              <button
                onClick={handleSimulateMarket}
                className={`px-2.5 py-1 border transition-all cursor-pointer uppercase ${
                  activeScenario === 'market' ? 'bg-[#2B2310] border-[#C7A45A] text-[#E8E3D5]' : 'bg-[#080B08] border-[#1A241B] text-[#9A9D91] hover:text-[#E8E3D5]'
                }`}
              >
                Demand Shift
              </button>
              {activeScenario !== 'default' && (
                <button
                  onClick={handleResetScenario}
                  className="px-2 py-1 bg-[#080B08] border border-[#1A241B] text-[#9A9D91] hover:text-[#E8E3D5] cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <span className="text-[10px] text-[#9A9D91] uppercase tracking-widest">
              SYSTEM: <strong className="text-[#6F956B]">{isBackendConnected ? 'LIVE' : 'ACTIVE'}</strong>
            </span>
          </div>
        </div>


        {/* =========================================================================
            1. TOP SECTION: THE FIELD & MARKET RIGHT NOW
            ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.25em] uppercase font-bold block mb-1">
                01 // LIVE TELEMETRY & MARKET DEMAND
              </span>
              <h1 className="font-display text-4xl sm:text-5xl text-[#E8E3D5] tracking-tight">
                THE FIELD & MARKET RIGHT NOW
              </h1>
            </div>
            <div className="font-mono text-xs text-[#9A9D91] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6F956B] animate-pulse" />
              <span>LIVE SYSTEM SYNC</span>
            </div>
          </div>

          {/* 5-Column Telemetry & Demand Grid (SOIL MOISTURE | RAIN CHANCE | BUYER DEMAND | EXPECTED YIELD | CROP) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch font-mono">
            
            {/* 1. SOIL MOISTURE */}
            <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between space-y-3">
              <span className="text-xs sm:text-sm text-[#9A9D91] tracking-widest uppercase font-semibold block">
                SOIL MOISTURE
              </span>
              <div>
                <div className="font-display text-4xl sm:text-5xl text-[#C7A45A] tracking-tight font-bold">
                  {telemetry.soilMoisture}%
                </div>
                <span className="text-xs text-[#C7A45A] font-bold tracking-wider uppercase block mt-1">
                  LOW MOISTURE
                </span>
              </div>
            </div>

            {/* 2. RAIN CHANCE */}
            <div className="p-6 bg-[#101510] border border-[#315F38] flex flex-col justify-between space-y-3">
              <span className="text-xs sm:text-sm text-[#6F956B] tracking-widest uppercase font-bold block">
                RAIN CHANCE
              </span>
              <div>
                <div className="font-display text-4xl sm:text-5xl text-[#6F956B] tracking-tight font-bold">
                  {telemetry.rainProbability}%
                </div>
                <span className="text-xs text-[#6F956B] font-bold tracking-wider uppercase block mt-1">
                  HIGH PROBABILITY
                </span>
              </div>
            </div>

            {/* 3. BUYER DEMAND (Connected to Buyer Dashboard Slider & MarketMind) */}
            <div className="p-6 bg-[#101510] border-2 border-[#C7A45A]/70 shadow-[0_0_20px_rgba(199,164,90,0.15)] flex flex-col justify-between space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-[#C7A45A] tracking-widest uppercase font-bold block">
                  BUYER DEMAND
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#2B2310] border border-[#C7A45A]/40 text-[#C7A45A] font-bold tracking-wider uppercase">
                  MARKET
                </span>
              </div>

              <div>
                <div className="font-display text-4xl sm:text-5xl text-[#E8E3D5] tracking-tight font-bold whitespace-nowrap">
                  {currentDemandKg.toLocaleString()} <span className="text-xl sm:text-2xl text-[#C7A45A] font-mono">KG</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#C7A45A] font-bold tracking-wider uppercase block">
                    COMMERCIAL TARGET
                  </span>
                  <Link to="/dashboard/buyer" className="text-[10px] text-[#9A9D91] hover:text-[#C7A45A] underline uppercase">
                    SLIDER ⚙
                  </Link>
                </div>
              </div>
            </div>

            {/* 4. EXPECTED YIELD */}
            <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between space-y-3">
              <span className="text-xs sm:text-sm text-[#9A9D91] tracking-widest uppercase font-semibold block">
                EXPECTED YIELD
              </span>
              <div>
                <div className="font-display text-4xl sm:text-5xl text-[#E8E3D5] tracking-tight font-bold whitespace-nowrap">
                  11,758 <span className="text-xl sm:text-2xl text-[#9A9D91] font-mono">KG</span>
                </div>
                <span className="text-xs text-[#6F956B] font-bold tracking-wider uppercase block mt-1">
                  CROPGUARD ML
                </span>
              </div>
            </div>

            {/* 5. CROP */}
            <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between space-y-3">
              <span className="text-xs sm:text-sm text-[#9A9D91] tracking-widest uppercase font-semibold block">
                CROP
              </span>
              <div>
                <div className="font-display text-4xl sm:text-5xl text-[#E8E3D5] tracking-tight font-bold uppercase truncate">
                  {telemetry.crop || 'RICE'}
                </div>
                <span className="text-xs text-[#9A9D91] font-semibold tracking-wider uppercase block mt-1">
                  {telemetry.cropStage || 'VEGETATIVE'} STAGE
                </span>
              </div>
            </div>

          </div>

          {/* Connected Pipeline Causality Chain Indicator */}
          <div className="p-3.5 bg-[#080B08] border border-[#1A241B] flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-[#9A9D91]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#C7A45A] font-bold uppercase">CAUSALITY CHAIN:</span>
              <span className="text-[#E8E3D5] font-semibold">BUYER DEMAND ({currentDemandKg.toLocaleString()} KG)</span>
              <span className="text-[#6F956B]">→</span>
              <span className="text-[#C7A45A] font-semibold">MARKETMIND (சந்தை)</span>
              <span className="text-[#6F956B]">→</span>
              <span className="text-[#E8E3D5] font-semibold">SURPLUS RECALCULATION</span>
              <span className="text-[#6F956B]">→</span>
              <span className="text-[#6F956B] font-bold">ACTIONFLOW DECISION</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>TEMP <strong className="text-[#E8E3D5]">{telemetry.temperature}°C</strong></span>
              <span>HUMIDITY <strong className="text-[#E8E3D5]">{telemetry.humidity}%</strong></span>
              <span>WIND <strong className="text-[#E8E3D5]">{telemetry.windSpeed} KM/H</strong></span>
            </div>
          </div>
        </section>


        {/* =========================================================================
            2. THE INTELLIGENCE LOOP
            ========================================================================= */}
        <section className="space-y-4 pt-4 border-t border-[#1A241B]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.25em] uppercase font-bold block mb-1">
                02 // COORDINATED AGENT NETWORK
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#E8E3D5] tracking-tight">
                THE INTELLIGENCE LOOP
              </h2>
            </div>
            
            {/* Pipeline Health Badge */}
            <div className="flex items-center gap-3 font-mono">
              <div className={`px-3.5 py-1.5 bg-[#101510] border ${pipelineHealth.online_agents === 4 ? 'border-[#315F38] text-[#6F956B]' : 'border-[#C7A45A] text-[#C7A45A]'} text-xs font-bold tracking-wider uppercase flex items-center gap-2 rounded-sm shadow-sm transition-all duration-300`}>
                <span className={`w-2 h-2 rounded-full ${pipelineHealth.online_agents === 4 ? 'bg-[#6F956B]' : 'bg-[#C7A45A] animate-pulse'}`} />
                <span>PIPELINE HEALTH: <strong>{pipelineHealth.online_agents} / {pipelineHealth.total_agents || 4} AGENTS ONLINE</strong></span>
              </div>
            </div>
          </div>

          {/* 4 Agent Cards in One Row with Status Indicators & Tamil-Dominant Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch font-mono">
            
            {/* Card 1: நிலம் (FarmSense) */}
            <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[230px] hover:border-[#315F38] transition-colors relative">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-3xl sm:text-4xl text-[#E8E3D5] font-bold">
                      நிலம்
                    </span>
                    <span className="text-xs text-[#9A9D91] font-mono">
                      (FarmSense)
                    </span>
                  </div>
                  <span className="text-[#6F956B] font-bold text-sm hidden lg:inline">→</span>
                </div>
                
                {/* Agent Status Badge */}
                <div className="my-2">
                  {agentStatuses.farmsense?.status === 'FAILED' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2B1010] border border-[#8F3E3E] text-[#E87979] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E87979] animate-pulse" />
                      🔴 FAILED
                    </span>
                  ) : agentStatuses.farmsense?.status === 'WAITING' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2B2310] border border-[#C7A45A]/40 text-[#C7A45A] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C7A45A]" />
                      🟡 WAITING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#102B18] border border-[#315F38] text-[#6F956B] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6F956B]" />
                      🟢 COMPLETED
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#9A9D91] font-sans leading-relaxed">
                  {agentStatuses.farmsense?.message || "Checks the farm's soil and weather."}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1A241B] mt-4">
                <div className="font-display text-xl text-[#E8E3D5] font-semibold">
                  {agents[0]?.mainMetric || '42% SOIL'}
                </div>
                <div className="text-xs text-[#6F956B] font-medium mt-0.5">
                  {agents[0]?.decision || 'No action needed'}
                </div>
              </div>
            </div>

            {/* Card 2: வளம் (CropGuard) */}
            <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[230px] hover:border-[#315F38] transition-colors relative">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-3xl sm:text-4xl text-[#E8E3D5] font-bold">
                      வளம்
                    </span>
                    <span className="text-xs text-[#9A9D91] font-mono">
                      (CropGuard)
                    </span>
                  </div>
                  <span className="text-[#6F956B] font-bold text-sm hidden lg:inline">→</span>
                </div>
                
                {/* Agent Status Badge */}
                <div className="my-2">
                  {agentStatuses.cropguard?.status === 'FAILED' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2B1010] border border-[#8F3E3E] text-[#E87979] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E87979] animate-pulse" />
                      🔴 FAILED
                    </span>
                  ) : agentStatuses.cropguard?.status === 'WAITING' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2B2310] border border-[#C7A45A]/40 text-[#C7A45A] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C7A45A]" />
                      🟡 WAITING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#102B18] border border-[#315F38] text-[#6F956B] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6F956B]" />
                      🟢 COMPLETED
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#9A9D91] font-sans leading-relaxed">
                  {agentStatuses.cropguard?.message || "Checks the crop's health and expected harvest."}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1A241B] mt-4">
                <div className="font-display text-xl text-[#E8E3D5] font-semibold">
                  {agents[1]?.mainMetric || 'LOW STRESS'}
                </div>
                <div className="text-xs text-[#C7A45A] font-medium mt-0.5">
                  {agents[1]?.decision || '11,758 KG EXPECTED'}
                </div>
              </div>
            </div>

            {/* Card 3: சந்தை (MarketMind) */}
            <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[230px] hover:border-[#C7A45A]/60 transition-colors relative">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-3xl sm:text-4xl text-[#E8E3D5] font-bold">
                      சந்தை
                    </span>
                    <span className="text-xs text-[#9A9D91] font-mono">
                      (MarketMind)
                    </span>
                  </div>
                  <span className="text-[#6F956B] font-bold text-sm hidden lg:inline">→</span>
                </div>
                
                {/* Agent Status Badge */}
                <div className="my-2">
                  {agentStatuses.marketmind?.status === 'FAILED' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2B1010] border border-[#8F3E3E] text-[#E87979] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E87979] animate-pulse" />
                      🔴 FAILED
                    </span>
                  ) : agentStatuses.marketmind?.status === 'WAITING' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2B2310] border border-[#C7A45A]/40 text-[#C7A45A] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C7A45A]" />
                      🟡 WAITING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#102B18] border border-[#315F38] text-[#6F956B] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6F956B]" />
                      🟢 COMPLETED
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#9A9D91] font-sans leading-relaxed">
                  {agentStatuses.marketmind?.message || "Checks buyer demand and where the harvest can be sold."}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1A241B] mt-4">
                <div className="font-display text-xl text-[#E8E3D5] font-semibold">
                  {agents[2]?.mainMetric || '4,728.5 KG SURPLUS'}
                </div>
                <div className="text-xs text-[#C7A45A] font-medium mt-0.5">
                  {agents[2]?.decision || '₹1,99,732 AT RISK'}
                </div>
              </div>
            </div>

            {/* Card 4: செயல் (ActionFlow) — HIGHLIGHTED HERO DECISION AGENT */}
            <div className="p-6 bg-[#102B18]/70 border-2 border-[#6F956B] shadow-[0_0_30px_rgba(111,149,107,0.25)] flex flex-col justify-between min-h-[230px] relative">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#C7A45A] text-[#080B08] text-[9px] font-bold tracking-widest uppercase rounded-sm font-mono shadow-sm">
                KEY HERO DECISION
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-3xl sm:text-4xl text-[#E8E3D5] font-bold">
                      செயல்
                    </span>
                    <span className="text-xs text-[#6F956B] font-mono font-bold">
                      (ActionFlow)
                    </span>
                  </div>
                </div>

                {/* Agent Status Badge */}
                <div className="my-2">
                  {agentStatuses.actionflow?.status === 'FAILED' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2B1010] border border-[#8F3E3E] text-[#E87979] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E87979] animate-pulse" />
                      🔴 FAILED
                    </span>
                  ) : agentStatuses.actionflow?.status === 'WAITING' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#2B2310] border border-[#C7A45A]/40 text-[#C7A45A] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C7A45A]" />
                      🟡 WAITING
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#102B18] border border-[#315F38] text-[#6F956B] text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6F956B]" />
                      🟢 DECISION READY
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#E8E3D5]/90 font-sans leading-relaxed">
                  {agentStatuses.actionflow?.message || "Combines everything and decides what the farmer should do."}
                </p>
              </div>

              <div className="pt-3 border-t border-[#315F38] mt-4">
                <div className="font-display text-xl sm:text-2xl text-[#C7A45A] font-bold">
                  {pipelineHealth.online_agents < 4 ? 'DECISION PAUSED' : (agents[3]?.mainMetric === '1 PRIORITY ACTION' ? 'DELAY IRRIGATION' : agents[3]?.mainMetric || 'DELAY IRRIGATION')}
                </div>
                <div className="text-xs text-[#6F956B] font-bold mt-1 leading-normal">
                  {pipelineHealth.online_agents < 4 ? 'One or more agents require attention' : `✓ ${agents[3]?.decision || 'Rain is likely soon, so irrigation can wait and water can be saved.'}`}
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* =========================================================================
            3. ACTIONFLOW OUTPUT
            ========================================================================= */}
        <section className="space-y-4 pt-4 border-t border-[#1A241B]">
          <div className="flex items-baseline justify-between pb-2 border-b border-[#1A241B]">
            <div>
              <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.25em] uppercase font-bold block mb-1">
                03 // FINAL COORDINATED OUTPUT
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#E8E3D5] tracking-tight">
                ACTIONFLOW DECISION
              </h2>
            </div>
            <span className="font-mono text-xs sm:text-sm text-[#9A9D91] uppercase">
              {pipelineHealth.online_agents < 4 ? 'DECISION PAUSED' : `${actionPlan.length} PRIORITIZED ACTIONS`}
            </span>
          </div>

          {/* Decision Paused Warning if Pipeline Degraded */}
          {pipelineHealth.online_agents < 4 && (
            <div className="p-6 bg-[#2B1010]/80 border-2 border-[#8F3E3E] font-mono space-y-2">
              <div className="flex items-center gap-2 text-[#E87979] text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-[#E87979] animate-pulse" />
                <span>DECISION PAUSED // PIPELINE DEGRADED</span>
              </div>
              <h3 className="font-display text-2xl text-[#E8E3D5] font-bold">
                DECISION PAUSED
              </h3>
              <p className="text-xs text-[#E87979]">
                One or more intelligence agents require attention. The decision loop is paused until upstream pipeline data is restored.
              </p>
            </div>
          )}

          {/* Clean Action-Plan List */}
          <div className="space-y-3 font-mono text-xs">
            {actionPlan.map((act, idx) => (
              <div
                key={act.id || idx}
                className="p-5 bg-[#101510] border border-[#1A241B] hover:border-[#315F38] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <span className="font-display text-2xl text-[#6F956B] font-bold shrink-0">
                    0{idx + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl text-[#E8E3D5] font-semibold tracking-wide">
                      {act.title}
                    </h3>
                    <p className="text-[#9A9D91] text-xs sm:text-sm mt-0.5">
                      {act.impact}
                    </p>
                  </div>
                </div>

                <span className={`px-3 py-1 text-xs font-bold border tracking-wider uppercase shrink-0 self-start sm:self-center ${
                  act.priority === 'HIGH' ? 'bg-[#2B2310] border-[#C7A45A] text-[#C7A45A]' : 'bg-[#102B18] border-[#315F38] text-[#6F956B]'
                }`}>
                  {act.priority} PRIORITY
                </span>
              </div>
            ))}
          </div>
        </section>


        {/* =========================================================================
            4. CROP ROTATION
            ========================================================================= */}
        <section className="space-y-4 pt-4 border-t border-[#1A241B]">
          <div className="flex items-baseline justify-between pb-2 border-b border-[#1A241B]">
            <div>
              <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.25em] uppercase font-bold block mb-1">
                04 // AGRONOMIC PLANNING
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#E8E3D5] tracking-tight">
                CROP ROTATION
              </h2>
            </div>
            <span className="font-mono text-xs sm:text-sm text-[#9A9D91]">SOIL HEALTH BALANCE</span>
          </div>

          <div className="p-6 bg-[#101510] border border-[#1A241B] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Visual Sequence */}
            <div className="md:col-span-7 flex items-center justify-between gap-3 font-mono text-xs">
              <div className="p-4 bg-[#080B08] border border-[#1A241B] text-center flex-1">
                <span className="text-[9px] text-[#9A9D91] uppercase tracking-widest block mb-1">CURRENT CROP</span>
                <span className="font-display text-xl text-[#E8E3D5] font-semibold">{telemetry.crop || 'Rice'}</span>
              </div>

              <span className="text-[#6F956B] font-bold text-lg">↓</span>

              <div className="p-4 bg-[#102B18] border border-[#315F38] text-center flex-1">
                <span className="text-[9px] text-[#6F956B] uppercase tracking-widest block font-bold mb-1">RECOMMENDED NEXT</span>
                <span className="font-display text-xl text-[#E8E3D5] font-bold block">Black Gram / Legumes</span>
                <span className="text-[10px] text-[#6F956B]">உளுந்து</span>
              </div>

              <span className="text-[#9A9D91] font-bold text-lg">↓</span>

              <div className="p-4 bg-[#080B08] border border-[#1A241B] text-center flex-1">
                <span className="text-[9px] text-[#9A9D91] uppercase tracking-widest block mb-1">FUTURE ROTATION</span>
                <span className="font-display text-xl text-[#E8E3D5]">Sesame / Maize</span>
              </div>
            </div>

            {/* Supporting Information (3-4 Concise Reasons) */}
            <div className="md:col-span-5 space-y-2 font-mono text-xs text-[#9A9D91] md:border-l md:border-[#1A241B] md:pl-6">
              <div className="flex items-start gap-2">
                <span className="text-[#6F956B]">✓</span>
                <span className="text-[#E8E3D5]">Nitrogen fixation restores paddy fallow soil balance</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#6F956B]">✓</span>
                <span className="text-[#E8E3D5]">Optimal post-monsoon moisture match in Cauvery delta</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#6F956B]">✓</span>
                <span className="text-[#E8E3D5]">Breaks soil pest and crop pathogen cycles</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[#1A241B] py-8 text-center sm:text-left">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#9A9D91]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#315F38]" />
            <span>FARMFLOW AI // EXECUTIVE COMMAND CENTER</span>
          </div>
          <div className="flex items-center gap-6">
            <span>THANJAVUR, TAMIL NADU, INDIA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
