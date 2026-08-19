import React, { useState, useRef } from 'react';
import Navigation from '../components/Navigation';
import FieldBackground from '../components/FieldBackground';
import {
  initialFarmProfile,
  defaultTelemetry,
  weatherSimulationTelemetry,
  defaultAgents,
  weatherSimulationAgents,
  marketSimulationAgents,
  defaultActionPlan,
  weatherSimulationActionPlan,
  marketSimulationActionPlan,
  defaultHarvestDestinations,
  marketSimulationHarvestDestinations,
  defaultImpactMetrics,
  weatherSimulationImpactMetrics,
  marketSimulationImpactMetrics,
  defaultIntelligenceStream,
  weatherSimulationStreamEvents,
  marketSimulationStreamEvents,
} from '../data/mockData';

const agentTamilNames = {
  farmsense: 'நிலம்',
  cropguard: 'வளம்',
  marketmind: 'சந்தை',
  actionflow: 'செயல்',
};

export default function Dashboard() {
  // Scenario state: 'default' | 'weather' | 'market'
  const [activeScenario, setActiveScenario] = useState('default');
  const [isSimulatingSignal, setIsSimulatingSignal] = useState(false);
  const [activeSignalStage, setActiveSignalStage] = useState(0);

  // Dynamic Data States
  const [telemetry, setTelemetry] = useState(defaultTelemetry);
  const [agents, setAgents] = useState(defaultAgents);
  const [actionPlan, setActionPlan] = useState(defaultActionPlan);
  const [harvestDestinations, setHarvestDestinations] = useState(defaultHarvestDestinations);
  const [impactMetrics, setImpactMetrics] = useState(defaultImpactMetrics);
  const [streamLogs, setStreamLogs] = useState(defaultIntelligenceStream);

  const streamEndRef = useRef(null);

  // Trigger agent signal propagation animation
  const triggerAgentSignalAnimation = () => {
    setIsSimulatingSignal(true);
    setActiveSignalStage(1);

    const timer1 = setTimeout(() => setActiveSignalStage(2), 400);
    const timer2 = setTimeout(() => setActiveSignalStage(3), 800);
    const timer3 = setTimeout(() => setActiveSignalStage(4), 1200);
    const timerEnd = setTimeout(() => {
      setIsSimulatingSignal(false);
      setActiveSignalStage(0);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerEnd);
    };
  };

  // Handle Weather Simulation
  const handleSimulateWeather = () => {
    setActiveScenario('weather');
    triggerAgentSignalAnimation();

    setTelemetry(weatherSimulationTelemetry);
    setAgents(weatherSimulationAgents);
    setActionPlan(weatherSimulationActionPlan);
    setHarvestDestinations(defaultHarvestDestinations);
    setImpactMetrics(weatherSimulationImpactMetrics);
    
    // Prepend new weather events to the live stream
    setStreamLogs(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const newItems = weatherSimulationStreamEvents.filter(item => !existingIds.has(item.id));
      return [...newItems, ...prev];
    });
  };

  // Handle Market Simulation
  const handleSimulateMarket = () => {
    setActiveScenario('market');
    triggerAgentSignalAnimation();

    setTelemetry(defaultTelemetry);
    setAgents(marketSimulationAgents);
    setActionPlan(marketSimulationActionPlan);
    setHarvestDestinations(marketSimulationHarvestDestinations);
    setImpactMetrics(marketSimulationImpactMetrics);

    // Prepend new market events to the live stream
    setStreamLogs(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const newItems = marketSimulationStreamEvents.filter(item => !existingIds.has(item.id));
      return [...newItems, ...prev];
    });
  };

  // Handle Reset
  const handleResetScenario = () => {
    setActiveScenario('default');
    setIsSimulatingSignal(false);
    setActiveSignalStage(0);

    setTelemetry(defaultTelemetry);
    setAgents(defaultAgents);
    setActionPlan(defaultActionPlan);
    setHarvestDestinations(defaultHarvestDestinations);
    setImpactMetrics(defaultImpactMetrics);
    setStreamLogs(defaultIntelligenceStream);
  };

  return (
    <div className="min-h-screen bg-[#080B08] text-[#E8E3D5] relative selection:bg-[#315F38]/40 selection:text-[#E8E3D5]">
      <FieldBackground />
      <Navigation />

      {/* Main Command Center Operational Flow */}
      <main className="relative z-10 pt-20 md:pt-24 pb-24 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        
        {/* =========================================================================
            COMMAND CENTER HEADER
            ========================================================================= */}
        <header className="py-8 border-b border-[#1A241B] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 bg-[#6F956B]" />
              <span className="font-mono text-[10px] text-[#9A9D91] tracking-[0.25em] uppercase font-medium">
                {initialFarmProfile.name} // {initialFarmProfile.stage} STAGE // {initialFarmProfile.location}
              </span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-[#E8E3D5] tracking-tight leading-none">
              COMMAND <br className="sm:hidden" />
              <span className="italic font-serif text-[#6F956B]">CENTER</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-mono text-xs">
            <div className="px-4 py-2 bg-[#101510] border border-[#1A241B] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#6F956B] animate-status-dot" />
              <span className="text-[#9A9D91] text-[10px] tracking-wider uppercase">System Active</span>
            </div>
            <div className="px-4 py-2 bg-[#101510] border border-[#1A241B] flex items-center gap-3">
              <span className="text-[#9A9D91] text-[10px] tracking-wider uppercase">Scenario:</span>
              <span className={`text-[11px] font-medium tracking-wider uppercase ${
                activeScenario === 'weather' ? 'text-[#6F956B]' : activeScenario === 'market' ? 'text-[#C7A45A]' : 'text-[#E8E3D5]'
              }`}>
                {activeScenario === 'default' ? 'Base Baseline' : activeScenario === 'weather' ? 'Weather Storm Alert' : 'Market Surplus Shift'}
              </span>
            </div>
          </div>
        </header>


        {/* =========================================================================
            SECTION 01 — THE FIELD RIGHT NOW
            ========================================================================= */}
        <section className="py-14 border-b border-[#1A241B]">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-1">
                01 // LIVE TELEMETRY
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#E8E3D5]">
                THE FIELD RIGHT NOW
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#9A9D91] tracking-widest uppercase hidden sm:block">
              ROMA HERITAGE TOMATO • PLOT A-D
            </span>
          </div>

          {/* Asymmetric Field Layout: Dominant Moisture & Crop Health */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Primary Dominant 1: Soil Moisture */}
            <div className="md:col-span-4 p-8 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[260px] relative overflow-hidden">
              <div className="relative z-10">
                <span className="font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase block mb-2">
                  Soil Moisture Content
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-6xl sm:text-7xl text-[#E8E3D5] tracking-tight">
                    {telemetry.soilMoisture}%
                  </span>
                  <span className="font-mono text-xs text-[#6F956B]">
                    {activeScenario === 'weather' ? '↑ +9% INCOMING' : 'STABLE'}
                  </span>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-[#1A241B]">
                <span className="font-mono text-xs text-[#9A9D91] block">
                  {telemetry.soilStatus}
                </span>
                <div className="w-full bg-[#080B08] h-1.5 mt-3 border border-[#1A241B]">
                  <div
                    className="h-full bg-[#315F38] transition-all duration-700"
                    style={{ width: `${telemetry.soilMoisture}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Primary Dominant 2: Crop Health */}
            <div className="md:col-span-4 p-8 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[260px]">
              <div>
                <span className="font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase block mb-2">
                  Crop Health Index
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-6xl sm:text-7xl text-[#E8E3D5] tracking-tight">
                    {telemetry.cropHealth}
                  </span>
                  <span className="font-mono text-sm text-[#9A9D91]">/ 100</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1A241B]">
                <span className="font-mono text-xs text-[#6F956B] block mb-2">
                  {telemetry.cropHealthStatus}
                </span>
                {/* Segmented meter */}
                <div className="grid grid-cols-10 gap-1 h-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full transition-colors ${
                        i < Math.floor(telemetry.cropHealth / 10)
                          ? 'bg-[#6F956B]'
                          : 'bg-[#1A241B]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Supporting Telemetry Triad */}
            <div className="md:col-span-4 grid grid-cols-1 gap-4">
              <div className="p-4 bg-[#101510] border border-[#1A241B] flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] text-[#9A9D91] tracking-widest uppercase block">Rain Probability</span>
                  <span className={`font-display text-3xl ${telemetry.rainProbability > 80 ? 'text-[#6F956B]' : 'text-[#E8E3D5]'}`}>
                    {telemetry.rainProbability}%
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#9A9D91] max-w-[130px] text-right">
                  {telemetry.rainForecast}
                </span>
              </div>

              <div className="p-4 bg-[#101510] border border-[#1A241B] flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] text-[#9A9D91] tracking-widest uppercase block">Ambient Temp</span>
                  <span className="font-display text-3xl text-[#E8E3D5]">
                    {telemetry.temperature}{telemetry.tempUnit}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#9A9D91] text-right">
                  Humidity: {telemetry.humidity}%
                </span>
              </div>

              <div className="p-4 bg-[#101510] border border-[#1A241B] flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] text-[#9A9D91] tracking-widest uppercase block">Expected Yield</span>
                  <span className="font-display text-3xl text-[#C7A45A]">
                    {telemetry.expectedYield.toLocaleString()} <span className="text-xs font-mono">{telemetry.yieldUnit}</span>
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#6F956B] text-right">
                  Window: 5–7 Days
                </span>
              </div>
            </div>

          </div>

          {/* Secondary Telemetry Details Strip */}
          <div className="mt-6 pt-4 border-t border-[#1A241B] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 font-mono text-[11px] text-[#9A9D91]">
            <div>WIND: <span className="text-[#E8E3D5]">{telemetry.windSpeed} {telemetry.windUnit}</span></div>
            <div>HUMIDITY: <span className="text-[#E8E3D5]">{telemetry.humidity}%</span></div>
            <div>STAGE: <span className="text-[#E8E3D5]">{telemetry.cropStage}</span></div>
            <div>UV INDEX: <span className="text-[#E8E3D5]">{telemetry.uvIndex}</span></div>
            <div>SOIL PH: <span className="text-[#E8E3D5]">{telemetry.soilPh}</span></div>
            <div>CANOPY: <span className="text-[#6F956B]">OPTIMAL</span></div>
          </div>
        </section>


        {/* =========================================================================
            SECTION 02 — THE INTELLIGENCE LOOP (MULTI-AGENT NETWORK)
            ========================================================================= */}
        <section className="py-14 border-b border-[#1A241B]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-1">
                02 // COORDINATED AGENT NETWORK
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#E8E3D5]">
                THE INTELLIGENCE LOOP
              </h2>
            </div>
            <div className="font-mono text-[10px] text-[#9A9D91] flex items-center gap-2">
              <span className="text-[#6F956B]">SENSE</span>
              <span>→</span>
              <span className="text-[#6F956B]">PREDICT</span>
              <span>→</span>
              <span className="text-[#C7A45A]">MATCH</span>
              <span>→</span>
              <span className="text-[#E8E3D5]">ACT</span>
            </div>
          </div>

          {/* Horizontal Agent Pipeline with Signal Connections */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-l border-[#1A241B] relative">
            {agents.map((agent, index) => {
              const isStageActive = isSimulatingSignal && activeSignalStage === index + 1;

              return (
                <div
                  key={agent.id}
                  className={`p-6 border-r border-b border-[#1A241B] bg-[#101510] transition-all duration-500 relative flex flex-col justify-between min-h-[290px] ${
                    isStageActive ? 'bg-[#102B18] border-[#6F956B]' : agent.alert ? 'border-b-[#C7A45A]' : ''
                  }`}
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#1A241B]">
                      <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.2em] uppercase font-medium">
                        {agent.phase}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-[#9A9D91]">{agent.status}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          agent.alert ? 'bg-[#C7A45A] animate-pulse' : 'bg-[#6F956B]'
                        }`} />
                      </div>
                    </div>

                    {/* Agent Name */}
                    <div className="mb-1">
                      <h3 className="font-display text-2xl text-[#E8E3D5] tracking-wide leading-tight">
                        {agentTamilNames[agent.id] || agent.name}
                      </h3>
                      <span className="font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase block mt-0.5">
                        {agent.name}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-[#9A9D91] mb-6">
                      {agent.role}
                    </p>
                  </div>

                  {/* Core Question & Current Answer */}
                  <div className="pt-4 border-t border-[#1A241B]">
                    <span className="font-mono text-[9px] text-[#9A9D91] tracking-widest uppercase block mb-1">
                      {agent.question}
                    </span>
                    <div className={`font-mono text-sm font-semibold tracking-wide ${
                      agent.alert ? 'text-[#C7A45A]' : 'text-[#E8E3D5]'
                    }`}>
                      {agent.decision}
                    </div>
                    <div className="font-mono text-[10px] text-[#6F956B] mt-0.5">
                      {agent.detail}
                    </div>
                  </div>

                  {/* Visual Inter-Agent Signal Transmission Indicator */}
                  {isStageActive && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[#6F956B] animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-[#9A9D91]">
            <span>SIGNAL PROPAGATION LATENCY: &lt;14MS</span>
            <span className="text-[#6F956B]">AUTONOMOUS CONSENSUS VERIFIED</span>
          </div>
        </section>


        {/* =========================================================================
            SECTION 03 — FARMFLOW DECISION (HERO DECISION SECTION)
            ========================================================================= */}
        <section className="py-14 border-b border-[#1A241B] bg-[#0c120c] p-6 sm:p-10 my-8 border">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#1A241B] gap-4">
            <div>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.3em] uppercase block mb-2 font-medium">
                03 // FINAL COORDINATED OUTPUT
              </span>
              <h2 className="font-display text-4xl sm:text-5xl text-[#E8E3D5]">
                FARMFLOW DECISION
              </h2>
            </div>
            <div className="font-mono text-xs text-[#9A9D91] max-w-sm">
              <span className="text-[#E8E3D5] font-semibold">THE AGENTS THINK. FARMFLOW DECIDES.</span>
              <br />
              All downstream valve controls, staging windows, and zero-waste contracts are automatically synchronized.
            </div>
          </div>

          {/* Large Action Instruction Rows */}
          <div className="space-y-4">
            {actionPlan.map((action) => (
              <div
                key={action.id}
                className="p-6 bg-[#101510] border border-[#1A241B] hover:border-[#315F38] transition-all grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
              >
                {/* Index Number */}
                <div className="md:col-span-1 font-display text-3xl sm:text-4xl text-[#6F956B]">
                  {action.id}
                </div>

                {/* Main Instruction */}
                <div className="md:col-span-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[9px] px-2 py-0.5 border ${
                      action.priority === 'HIGH' ? 'border-[#C7A45A] text-[#C7A45A]' : 'border-[#1A241B] text-[#9A9D91]'
                    }`}>
                      {action.priority} PRIORITY
                    </span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl text-[#E8E3D5] tracking-wide mt-1">
                    {action.title}
                  </h3>
                </div>

                {/* Primary Impact */}
                <div className="md:col-span-3 font-mono text-xs text-[#6F956B] font-medium">
                  {action.impact}
                </div>

                {/* Context Details */}
                <div className="md:col-span-4 font-mono text-[11px] text-[#9A9D91] leading-relaxed">
                  {action.context}
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* =========================================================================
            SECTION 04 — WHERE THE HARVEST GOES (PRODUCE ALLOCATION)
            ========================================================================= */}
        <section className="py-14 border-b border-[#1A241B]">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-1">
                04 // ZERO-WASTE SUPPLY CHAIN
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#E8E3D5]">
                WHERE THE HARVEST GOES
              </h2>
            </div>
            <div className="font-mono text-xs text-[#E8E3D5]">
              TOTAL HARVEST: <span className="font-display text-xl text-[#C7A45A]">{harvestDestinations.totalHarvest.toLocaleString()} KG</span>
            </div>
          </div>

          {/* Visual Harvest Destination Allocation Bar & Blocks */}
          <div className="p-8 bg-[#101510] border border-[#1A241B] space-y-8">
            
            {/* Visual Continuous Allocation Bar */}
            <div>
              <div className="flex justify-between font-mono text-[10px] text-[#9A9D91] mb-2 uppercase tracking-wider">
                <span>Farm Output (1,420 KG)</span>
                <span>Autonomous Demand Balancing</span>
              </div>
              <div className="w-full h-3 bg-[#080B08] flex overflow-hidden border border-[#1A241B]">
                {harvestDestinations.channels.map((channel) => (
                  <div
                    key={channel.name}
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${channel.percentage}%`,
                      backgroundColor: channel.color,
                    }}
                    title={`${channel.name}: ${channel.amount} KG (${channel.percentage}%)`}
                  />
                ))}
              </div>
            </div>

            {/* Destination Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-[#1A241B]">
              {harvestDestinations.channels.map((channel) => (
                <div
                  key={channel.name}
                  className="p-5 bg-[#080B08] border border-[#1A241B] flex flex-col justify-between min-h-[160px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: channel.color }} />
                      <span className="font-mono text-xs font-semibold text-[#E8E3D5] tracking-wider uppercase">
                        {channel.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#9A9D91]">{channel.percentage}%</span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-4xl text-[#E8E3D5]">
                        {channel.amount.toLocaleString()}
                      </span>
                      <span className="font-mono text-xs text-[#9A9D91]">KG</span>
                    </div>
                    <p className="font-mono text-[10px] text-[#9A9D91] mt-2">
                      {channel.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] text-[#9A9D91] pt-2">
              <span>ZERO PERISHABLE SURPLUS DIVERTED TO LANDFILL</span>
              <span className="text-[#C7A45A]">100% ACCOUNTED PRODUCTION</span>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION 05 — MEASURED IMPACT
            ========================================================================= */}
        <section className="py-14 border-b border-[#1A241B]">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-1">
                05 // ECONOMIC & ENVIRONMENTAL AUDIT
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#E8E3D5]">
                MEASURED IMPACT
              </h2>
            </div>
            <span className="font-mono text-[9px] text-[#9A9D91] tracking-widest uppercase">
              {impactMetrics.disclaimer}
            </span>
          </div>

          {/* 4 Large Primary Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {impactMetrics.primary.map((metric) => (
              <div
                key={metric.id}
                className="p-8 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <span className="font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase block mb-2">
                    {metric.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`font-display text-5xl sm:text-6xl tracking-tight ${
                      metric.highlight ? 'text-[#C7A45A]' : 'text-[#E8E3D5]'
                    }`}>
                      {metric.value}
                    </span>
                    {metric.unit && (
                      <span className="font-mono text-sm text-[#9A9D91]">{metric.unit}</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1A241B] font-mono text-[10px] text-[#9A9D91] leading-relaxed">
                  {metric.description}
                </div>
              </div>
            ))}
          </div>

          {/* Secondary Impact Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-[#101510] border border-[#1A241B]">
            {impactMetrics.secondary.map((sec) => (
              <div key={sec.id} className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-[#E8E3D5] font-semibold tracking-wider block">{sec.label}</span>
                  <span className="font-mono text-[10px] text-[#9A9D91]">{sec.detail}</span>
                </div>
                <span className="font-display text-3xl text-[#6F956B]">{sec.value}</span>
              </div>
            ))}
          </div>
        </section>


        {/* =========================================================================
            INTELLIGENCE STREAM + SCENARIO CONTROLS
            ========================================================================= */}
        <section className="py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Live Intelligence Stream (Terminal Log) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A241B]">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#6F956B] animate-status-dot" />
                <span className="font-mono text-xs text-[#E8E3D5] tracking-[0.2em] uppercase font-semibold">
                  INTELLIGENCE STREAM
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-widest uppercase">
                ● LIVE FEED
              </span>
            </div>

            <div className="bg-[#101510] border border-[#1A241B] p-4 max-h-[300px] overflow-y-auto space-y-2.5 font-mono text-xs">
              {streamLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 py-1.5 border-b border-[#1A241B]/40 animate-feed-item"
                >
                  <span className="text-[#9A9D91] text-[10px] shrink-0 mt-0.5">{log.time}</span>
                  <span className={`text-[10px] font-bold shrink-0 tracking-wider w-24 ${
                    log.agent === 'FARMSENSE' ? 'text-[#6F956B]' :
                    log.agent === 'CROPGUARD' ? 'text-[#6F956B]' :
                    log.agent === 'MARKETMIND' ? 'text-[#C7A45A]' : 'text-[#E8E3D5]'
                  }`}>
                    {log.agent}
                  </span>
                  <span className="text-[#E8E3D5]/90 text-[11px] leading-relaxed">
                    {log.event}
                  </span>
                </div>
              ))}
              <div ref={streamEndRef} />
            </div>
          </div>

          {/* Interactive Simulation Scenario Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A241B]">
              <span className="font-mono text-xs text-[#E8E3D5] tracking-[0.2em] uppercase font-semibold">
                SCENARIO CONTROL
              </span>
              <span className="font-mono text-[10px] text-[#9A9D91] tracking-widest uppercase">
                HACKATHON DEMO
              </span>
            </div>

            <div className="p-6 bg-[#101510] border border-[#1A241B] space-y-4">
              <p className="font-mono text-xs text-[#9A9D91] leading-relaxed">
                Trigger real-time dynamic environmental or demand disturbances to watch the four-agent loop adjust decisions autonomously:
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSimulateWeather}
                  className={`w-full py-3.5 px-4 font-mono text-xs tracking-[0.15em] uppercase text-left flex items-center justify-between border transition-all ${
                    activeScenario === 'weather'
                      ? 'bg-[#102B18] border-[#6F956B] text-[#E8E3D5]'
                      : 'bg-[#080B08] border-[#1A241B] text-[#9A9D91] hover:border-[#315F38] hover:text-[#E8E3D5]'
                  }`}
                >
                  <span>1. SIMULATE WEATHER CHANGE</span>
                  <span className="text-[10px] text-[#6F956B]">Rain 78% → 85%</span>
                </button>

                <button
                  onClick={handleSimulateMarket}
                  className={`w-full py-3.5 px-4 font-mono text-xs tracking-[0.15em] uppercase text-left flex items-center justify-between border transition-all ${
                    activeScenario === 'market'
                      ? 'bg-[#2B2310] border-[#C7A45A] text-[#E8E3D5]'
                      : 'bg-[#080B08] border-[#1A241B] text-[#9A9D91] hover:border-[#C7A45A] hover:text-[#E8E3D5]'
                  }`}
                >
                  <span>2. SIMULATE MARKET CHANGE</span>
                  <span className="text-[10px] text-[#C7A45A]">Surplus 90 → 250 KG</span>
                </button>

                <button
                  onClick={handleResetScenario}
                  className="w-full py-3 px-4 bg-[#080B08] border border-[#1A241B] text-[#9A9D91] hover:text-[#E8E3D5] hover:border-[#9A9D91] font-mono text-xs tracking-[0.15em] uppercase text-center transition-all"
                >
                  RESET SCENARIO
                </button>
              </div>

              {/* Scenario Explanation Tag */}
              <div className="pt-3 border-t border-[#1A241B] font-mono text-[10px] text-[#9A9D91]/70">
                {activeScenario === 'weather' && (
                  <span className="text-[#6F956B]">
                    ✓ Storm front detected. FarmSense locks irrigation (2,400 L saved), CropGuard flags wind advisory, ActionFlow adapts harvest prep.
                  </span>
                )}
                {activeScenario === 'market' && (
                  <span className="text-[#C7A45A]">
                    ✓ Wholesale demand contracted. MarketMind routes 250 KG surplus to Food Rescue and Community Kitchens (₹18,400 value saved).
                  </span>
                )}
                {activeScenario === 'default' && (
                  <span>
                    Baseline state: Autonomous monitoring active across soil, weather, crop, and commercial channels.
                  </span>
                )}
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* =========================================================================
          COMMAND CENTER FOOTER
          ========================================================================= */}
      <footer className="border-t border-[#1A241B] py-8 text-center sm:text-left">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-[#9A9D91]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#315F38]" />
            <span>FARMFLOW AI // COMMAND CENTER LIVE FEED</span>
          </div>
          <div className="flex items-center gap-6">
            <span>AUTONOMOUS MULTI-AGENT PROTOCOL</span>
            <span>SIMULATION DEMO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
