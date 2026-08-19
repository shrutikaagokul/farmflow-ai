import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FieldBackground from '../components/FieldBackground';
import { defaultAgents } from '../data/mockData';

const agentTamilNames = {
  farmsense: 'நிலம்',
  cropguard: 'வளம்',
  marketmind: 'சந்தை',
  actionflow: 'செயல்',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080B08] text-[#E8E3D5] relative selection:bg-[#315F38]/40 selection:text-[#E8E3D5]">
      <FieldBackground />
      <Navigation />

      {/* Main Container */}
      <main className="relative z-10 pt-20 md:pt-24 pb-20 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
        
        {/* =========================================================================
            HERO SECTION
            ========================================================================= */}
        <section className="min-h-[86vh] flex flex-col justify-between pt-10 pb-12 border-b border-[#1A241B]">
          
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-[#6F956B]" />
            <span className="font-mono text-[10px] sm:text-xs text-[#9A9D91] tracking-[0.25em] uppercase font-medium">
              PRECISION AGRICULTURE / ZERO-WASTE SUPPLY CHAIN
            </span>
          </div>

          {/* Headline Composition */}
          <div className="my-8 md:my-12">
            <h1 className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] tracking-tight leading-[0.88] text-[#E8E3D5]">
              FARM <br />
              <span className="text-[#6F956B] italic font-serif font-light">TO</span> <br />
              FLOW<span className="text-[#C7A45A]">.</span>
            </h1>

            {/* Tamil Brand Tagline */}
            <p className="font-tamil text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#C7A45A] font-light tracking-wide italic mt-6 md:mt-8">
              மண்ணின் மொழி, அறிவின் வழி
            </p>

            <div className="mt-6 md:mt-8 max-w-3xl">
              <p className="font-display text-2xl sm:text-3xl md:text-4xl text-[#E8E3D5]/90 leading-tight tracking-wide">
                AUTONOMOUS INTELLIGENCE FOR THE JOURNEY FROM SOIL TO HARVEST TO DESTINATION.
              </p>
            </div>
          </div>

          {/* Hero Action & Annotation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-6 border-t border-[#1A241B]">
            {/* Copy & CTA */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-sm sm:text-base text-[#9A9D91] font-sans leading-relaxed max-w-lg">
                FarmFlow connects real-time farm conditions, crop intelligence, market demand and distribution into one autonomous decision loop.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/try-demo"
                  className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#102B18] border border-[#315F38] text-[#E8E3D5] font-mono text-xs tracking-[0.2em] uppercase hover:bg-[#315F38] hover:border-[#6F956B] transition-all shadow-[0_0_20px_rgba(49,95,56,0.2)] group"
                >
                  <span className="w-2 h-2 rounded-full bg-[#6F956B] animate-pulse" />
                  <span>Try Live Demo</span>
                  <span className="text-[#6F956B] group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#101510] border border-[#1A241B] text-[#9A9D91] hover:text-[#E8E3D5] hover:border-[#315F38] font-mono text-xs tracking-[0.2em] uppercase transition-all"
                >
                  <span>Command Center</span>
                </Link>

                <div className="font-mono text-[10px] tracking-[0.25em] text-[#9A9D91] uppercase flex items-center gap-2 pl-2">
                  <span className="text-[#6F956B]">SENSE</span>
                  <span className="text-[#1A241B]">•</span>
                  <span className="text-[#6F956B]">PREDICT</span>
                  <span className="text-[#1A241B]">•</span>
                  <span className="text-[#C7A45A]">MATCH</span>
                  <span className="text-[#1A241B]">•</span>
                  <span className="text-[#E8E3D5]">ACT</span>
                </div>
              </div>
            </div>

            {/* Editorial Metric Strip */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 lg:pt-0 lg:border-l lg:border-[#1A241B] lg:pl-8">
              <div>
                <span className="block font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase">Field Target</span>
                <span className="font-display text-lg sm:text-xl text-[#E8E3D5] mt-1 block">10-Acre</span>
                <span className="font-mono text-[10px] text-[#6F956B]">Paddy (Thanjavur)</span>
              </div>
              <div>
                <span className="block font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase">Projected</span>
                <span className="font-display text-lg sm:text-xl text-[#E8E3D5] mt-1 block">5,200 KG</span>
                <span className="font-mono text-[10px] text-[#9A9D91]">Expected Yield</span>
              </div>
              <div>
                <span className="block font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase">Water Conserved</span>
                <span className="font-display text-lg sm:text-xl text-[#6F956B] mt-1 block">2,100 L*</span>
                <span className="font-mono text-[10px] text-[#9A9D91]">Canal-Delay Savings</span>
              </div>
              <div>
                <span className="block font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase">Grain Preserved</span>
                <span className="font-display text-lg sm:text-xl text-[#C7A45A] mt-1 block">700 KG*</span>
                <span className="font-mono text-[10px] text-[#9A9D91]">State Procurement</span>
              </div>
            </div>
          </div>

          <div className="pt-4 text-right">
            <span className="font-mono text-[9px] text-[#9A9D91]/60 tracking-widest uppercase">
              *Simulated Prototype Scenario
            </span>
          </div>
        </section>


        {/* =========================================================================
            SECTION: THE PROBLEM
            ========================================================================= */}
        <section id="about" className="py-24 border-b border-[#1A241B]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-3">
                01 / THE DISCONNECTED HARVEST
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#E8E3D5] leading-[1.05]">
                FARMS DON'T <br />
                OPERATE IN <br />
                <span className="italic font-serif text-[#C7A45A]">ISOLATION.</span>
              </h2>
            </div>

            <div className="lg:col-span-7 lg:pl-12 lg:border-l lg:border-[#1A241B] space-y-8">
              <p className="text-xl sm:text-2xl text-[#E8E3D5]/90 font-display leading-snug">
                Traditional agriculture treats water, crops, market pricing, and food waste as four separate problems. In reality, they are a single chain reaction.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-[#1A241B]">
                <div className="space-y-2">
                  <span className="font-mono text-xs text-[#C7A45A] tracking-wider block">THE FRAGMENTATION</span>
                  <p className="text-xs sm:text-sm text-[#9A9D91] leading-relaxed">
                    A dry field prompts unnecessary irrigation before a rainstorm. Misjudged harvest timing oversupplies local mandis, collapsing farmer prices and rotting tons of fresh produce in transit.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="font-mono text-xs text-[#6F956B] tracking-wider block">THE FARMFLOW SOLUTION</span>
                  <p className="text-xs sm:text-sm text-[#9A9D91] leading-relaxed">
                    FarmFlow unites soil sensors, weather forecasts, crop health indices, and dynamic market channels into one continuous autonomous loop — eliminating waste before it begins.
                  </p>
                </div>
              </div>

              {/* Chain Reaction Flow */}
              <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#E8E3D5]">
                <div className="flex items-center gap-2">
                  <span className="text-[#6F956B]">01</span>
                  <span>Soil Moisture</span>
                </div>
                <span className="text-[#9A9D91]">→</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#6F956B]">02</span>
                  <span>Weather Timing</span>
                </div>
                <span className="text-[#9A9D91]">→</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#C7A45A]">03</span>
                  <span>Market Demand</span>
                </div>
                <span className="text-[#9A9D91]">→</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#E8E3D5]">04</span>
                  <span className="text-[#6F956B]">Zero Waste</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION: THE INTELLIGENCE (FOUR AGENTS)
            ========================================================================= */}
        <section id="intelligence" className="py-24 border-b border-[#1A241B]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-3">
                02 / MULTI-AGENT ARCHITECTURE
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#E8E3D5]">
                FOUR AGENTS. <br />
                <span className="italic font-serif text-[#6F956B]">ONE DECISION LOOP.</span>
              </h2>
            </div>
            <p className="text-sm text-[#9A9D91] font-mono max-w-md">
              Each specialized agent operates autonomously within its domain while continuously streaming real-time intelligence into the unified coordinator.
            </p>
          </div>

          {/* 4 Agent Editorial Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-[#1A241B]">
            {defaultAgents.map((agent, index) => (
              <div
                key={agent.id}
                className="p-8 border-r border-b border-[#1A241B] bg-[#080B08] hover:bg-[#101510] transition-colors flex flex-col justify-between min-h-[340px] group"
              >
                <div>
                  {/* Phase & Index */}
                  <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#1A241B]">
                    <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase font-medium">
                      PHASE 0{index + 1} // {agent.phase}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-[#6F956B]/40 group-hover:bg-[#6F956B] transition-colors" />
                  </div>

                  {/* Agent Name */}
                  <div className="mb-2">
                    <h3 className="font-display text-3xl text-[#E8E3D5] tracking-wide leading-tight">
                      {agentTamilNames[agent.id] || agent.name}
                    </h3>
                    <span className="font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase block mt-1">
                      {agent.name}
                    </span>
                  </div>
                  
                  {/* Responsibility */}
                  <p className="text-xs text-[#9A9D91] font-mono mb-8 leading-relaxed">
                    {agent.role}
                  </p>
                </div>

                {/* Example Live Decision */}
                <div className="pt-4 border-t border-[#1A241B]/60">
                  <span className="font-mono text-[9px] text-[#9A9D91]/70 tracking-widest uppercase block mb-1">
                    Live Evaluation
                  </span>
                  <div className="font-mono text-xs text-[#E8E3D5] group-hover:text-[#C7A45A] transition-colors">
                    "{agent.decision}"
                  </div>
                  <div className="text-[10px] font-mono text-[#6F956B] mt-0.5">
                    {agent.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* =========================================================================
            SECTION: HOW IT THINKS (DECISION LOOP)
            ========================================================================= */}
        <section className="py-24 border-b border-[#1A241B]">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-3">
              03 / AUTONOMOUS CAUSALITY
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#E8E3D5]">
              FROM SIGNAL <br />
              <span className="italic font-serif text-[#C7A45A]">TO ACTION.</span>
            </h2>
            <p className="text-sm text-[#9A9D91] mt-4 font-sans leading-relaxed">
              When an environmental parameter shifts, the intelligence cascades through the entire agent pipeline in milliseconds — transforming raw field telemetry into measurable environmental and financial savings.
            </p>
          </div>

          {/* Sequential Decision Pipeline Display */}
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-[#101510] border border-[#1A241B] items-center">
              <div className="md:col-span-3">
                <span className="font-mono text-[10px] text-[#9A9D91] tracking-widest uppercase">01. INGESTION</span>
                <h4 className="font-display text-xl text-[#E8E3D5]">Delta Field Conditions</h4>
              </div>
              <div className="md:col-span-6 font-mono text-xs text-[#9A9D91]">
                Telemetry registers 42% soil moisture (optimal for tillering), while delta radar detects 25% scattered monsoon showers.
              </div>
              <div className="md:col-span-3 text-right">
                <span className="font-mono text-xs text-[#6F956B]">நிலம் (FARMSENSE) ENGAGED</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-[#101510] border border-[#1A241B] items-center">
              <div className="md:col-span-3">
                <span className="font-mono text-[10px] text-[#9A9D91] tracking-widest uppercase">02. PREDICTION</span>
                <h4 className="font-display text-xl text-[#E8E3D5]">Paddy Health & Yield</h4>
              </div>
              <div className="md:col-span-6 font-mono text-xs text-[#9A9D91]">
                CropGuard evaluates Thanjavur Ponni Paddy vegetative tillering stand — 92/100 health index with 5,200 KG ML projected harvest.
              </div>
              <div className="md:col-span-3 text-right">
                <span className="font-mono text-xs text-[#6F956B]">வளம் (CROPGUARD) VERIFIED</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-[#101510] border border-[#1A241B] items-center">
              <div className="md:col-span-3">
                <span className="font-mono text-[10px] text-[#9A9D91] tracking-widest uppercase">03. DEMAND MATCHING</span>
                <h4 className="font-display text-xl text-[#E8E3D5]">Market & Surplus</h4>
              </div>
              <div className="md:col-span-6 font-mono text-xs text-[#9A9D91]">
                MarketMind identifies wholesale mandi can absorb 4,500 KG and routes 700 KG surplus to State Civil Supplies & grain banks.
              </div>
              <div className="md:col-span-3 text-right">
                <span className="font-mono text-xs text-[#C7A45A]">சந்தை (MARKETMIND) MATCHED</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-[#101510] border border-[#1A241B] items-center">
              <div className="md:col-span-3">
                <span className="font-mono text-[10px] text-[#9A9D91] tracking-widest uppercase">04. COORDINATION</span>
                <h4 className="font-display text-xl text-[#E8E3D5]">Final Action Plan</h4>
              </div>
              <div className="md:col-span-6 font-mono text-xs text-[#9A9D91]">
                ActionFlow generates coordinated instructions: Maintain canal water depth, prep grain storage, and forward contract 700 KG to state food security.
              </div>
              <div className="md:col-span-3 text-right">
                <span className="font-mono text-xs text-[#E8E3D5]">செயல் (ACTIONFLOW) EXECUTED</span>
              </div>
            </div>

            {/* Step 5 - Impact */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-[#102B18]/60 border border-[#315F38] items-center">
              <div className="md:col-span-3">
                <span className="font-mono text-[10px] text-[#6F956B] tracking-widest uppercase">05. OUTCOME</span>
                <h4 className="font-display text-xl text-[#E8E3D5]">Verified Impact</h4>
              </div>
              <div className="md:col-span-9 flex flex-wrap items-center justify-between gap-6 font-mono text-xs text-[#E8E3D5]">
                <div>
                  <span className="text-[#6F956B] font-display text-lg">2,100 L</span> Water Conserved
                </div>
                <div>
                  <span className="text-[#C7A45A] font-display text-lg">700 KG</span> Grain Rescued
                </div>
                <div>
                  <span className="text-[#E8E3D5] font-display text-lg">₹31,500</span> Value Recovered
                </div>
                <div>
                  <span className="text-[#6F956B] font-display text-lg">210 KG</span> CO₂e Averted
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SECTION: COMMAND CENTER PREVIEW / TRANSITION
            ========================================================================= */}
        <section className="py-24">
          <div className="border border-[#1A241B] bg-[#101510] p-8 sm:p-14 lg:p-20 relative overflow-hidden">
            <div className="max-w-2xl relative z-10">
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.3em] uppercase block mb-4 font-medium">
                FARMWORK / LIVE OPERATIONS
              </span>
              <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#E8E3D5] leading-[0.95] mb-8">
                SEE THE FARM <br />
                <span className="italic font-serif text-[#C7A45A]">THINK.</span>
              </h2>
              <p className="text-sm sm:text-base text-[#9A9D91] leading-relaxed mb-10">
                The Command Center brings telemetry, agent decisions, harvest allocation, and measurable impact into one operational view. Test weather and market shifts in real time.
              </p>
              
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-4 px-10 py-4 bg-[#315F38] text-[#E8E3D5] font-mono text-xs tracking-[0.2em] uppercase hover:bg-[#6F956B] transition-colors group"
              >
                <span>Open Command Center</span>
                <span className="group-hover:translate-x-1.5 transition-transform">→</span>
              </Link>
            </div>

            {/* Subtle background graphic */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden lg:block">
              <div className="w-full h-full bg-[radial-gradient(#6F956B_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
          </div>
        </section>

      </main>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="border-t border-[#1A241B] py-8 text-center sm:text-left">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-[#9A9D91]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#315F38]" />
            <span>FARMFLOW AI — AUTONOMOUS FARM-TO-MARKET INTELLIGENCE</span>
          </div>
          <div className="flex items-center gap-6">
            <span>VERSION 0.1.0 // CAUVERY DELTA</span>
            <span>THANJAVUR, TAMIL NADU, INDIA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
