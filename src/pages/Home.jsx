import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FieldBackground from '../components/FieldBackground';
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
            SECTION 1: THE SYSTEM ARCHITECTURE (FOUR AGENTS. ONE DECISION LOOP.)
            ========================================================================= */}
        <section id="architecture" className="py-24 border-b border-[#1A241B]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.25em] uppercase block mb-3 font-semibold">
                02 / MULTI-AGENT ARCHITECTURE
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#E8E3D5] tracking-tight uppercase">
                FOUR AGENTS. <br />
                <span className="italic font-serif text-[#6F956B]">ONE DECISION LOOP.</span>
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#9A9D91] font-mono max-w-md">
              Four specialized AI agents operating in sequence to translate raw farm signals into optimized decisions.
            </p>
          </div>

          {/* 4 Agent Architecture Cards Visually Connected */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch relative">
            
            {/* Agent 01: நிலம் (FARMSENSE) */}
            <div className="p-8 bg-[#101510] border border-[#1A241B] hover:border-[#315F38] transition-all flex flex-col justify-between space-y-6 group relative">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1A241B]">
                  <span className="font-mono text-xs font-bold text-[#6F956B]">AGENT 01</span>
                  <span className="font-mono text-[10px] text-[#6F956B] px-2 py-0.5 bg-[#102B18] border border-[#315F38] font-bold tracking-wider uppercase">
                    PHASE 01 // SENSE
                  </span>
                </div>

                <h3 className="font-tamil text-4xl text-[#E8E3D5] font-normal tracking-wide">
                  நிலம்
                </h3>
                <span className="font-mono text-xs text-[#9A9D91] tracking-widest uppercase font-semibold block mt-1">
                  FARMSENSE
                </span>
              </div>

              <p className="font-mono text-xs sm:text-sm text-[#E8E3D5] leading-relaxed pt-3 border-t border-[#1A241B]">
                Reads field conditions.
              </p>
            </div>

            {/* Agent 02: வளம் (CROPGUARD) */}
            <div className="p-8 bg-[#101510] border border-[#1A241B] hover:border-[#315F38] transition-all flex flex-col justify-between space-y-6 group relative">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1A241B]">
                  <span className="font-mono text-xs font-bold text-[#6F956B]">AGENT 02</span>
                  <span className="font-mono text-[10px] text-[#6F956B] px-2 py-0.5 bg-[#102B18] border border-[#315F38] font-bold tracking-wider uppercase">
                    PHASE 02 // PREDICT
                  </span>
                </div>

                <h3 className="font-tamil text-4xl text-[#E8E3D5] font-normal tracking-wide">
                  வளம்
                </h3>
                <span className="font-mono text-xs text-[#9A9D91] tracking-widest uppercase font-semibold block mt-1">
                  CROPGUARD
                </span>
              </div>

              <p className="font-mono text-xs sm:text-sm text-[#E8E3D5] leading-relaxed pt-3 border-t border-[#1A241B]">
                Evaluates crop health and yield.
              </p>
            </div>

            {/* Agent 03: சந்தை (MARKETMIND) */}
            <div className="p-8 bg-[#101510] border border-[#1A241B] hover:border-[#C7A45A]/60 transition-all flex flex-col justify-between space-y-6 group relative">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1A241B]">
                  <span className="font-mono text-xs font-bold text-[#C7A45A]">AGENT 03</span>
                  <span className="font-mono text-[10px] text-[#C7A45A] px-2 py-0.5 bg-[#2B2310] border border-[#C7A45A]/40 font-bold tracking-wider uppercase">
                    PHASE 03 // MATCH
                  </span>
                </div>

                <h3 className="font-tamil text-4xl text-[#E8E3D5] font-normal tracking-wide">
                  சந்தை
                </h3>
                <span className="font-mono text-xs text-[#9A9D91] tracking-widest uppercase font-semibold block mt-1">
                  MARKETMIND
                </span>
              </div>

              <p className="font-mono text-xs sm:text-sm text-[#E8E3D5] leading-relaxed pt-3 border-t border-[#1A241B]">
                Understands demand, surplus and market opportunities.
              </p>
            </div>

            {/* Agent 04: செயல் (ACTIONFLOW) */}
            <div className="p-8 bg-[#102B18]/70 border-2 border-[#6F956B] shadow-[0_0_25px_rgba(111,149,107,0.25)] transition-all flex flex-col justify-between space-y-6 relative">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#315F38]">
                  <span className="font-mono text-xs font-bold text-[#E8E3D5]">AGENT 04</span>
                  <span className="font-mono text-[10px] text-[#E8E3D5] px-2 py-0.5 bg-[#1A241B] border border-[#6F956B] font-bold tracking-wider uppercase">
                    PHASE 04 // ACT
                  </span>
                </div>

                <h3 className="font-tamil text-4xl text-[#E8E3D5] font-normal tracking-wide">
                  செயல்
                </h3>
                <span className="font-mono text-xs text-[#E8E3D5] tracking-widest uppercase font-bold block mt-1">
                  ACTIONFLOW
                </span>
              </div>

              <p className="font-mono text-xs sm:text-sm text-[#E8E3D5] leading-relaxed pt-3 border-t border-[#315F38]">
                Combines the outputs and decides what action should be taken.
              </p>
            </div>

          </div>

          {/* Visual Architecture Flow Strip */}
          <div className="mt-8 p-4 bg-[#080B08] border border-[#1A241B] flex items-center justify-center font-mono text-xs sm:text-sm text-[#9A9D91]">
            <span className="tracking-[0.2em] font-semibold uppercase">ARCHITECTURE FLOW:</span>
            <span className="ml-4 font-bold text-[#E8E3D5]">
              நிலம் <span className="text-[#6F956B] mx-2">→</span> வளம் <span className="text-[#6F956B] mx-2">→</span> சந்தை <span className="text-[#C7A45A] mx-2">→</span> செயல்
            </span>
          </div>
        </section>


        {/* =========================================================================
            SECTION 2: LIVE DEMONSTRATION EXAMPLE (FROM SIGNAL TO ACTION.)
            ========================================================================= */}
        <section id="demo-example" className="py-24 border-b border-[#1A241B] space-y-16">
          
          {/* Section Hero */}
          <div className="max-w-3xl space-y-3">
            <span className="font-mono text-xs sm:text-sm text-[#C7A45A] tracking-[0.25em] uppercase font-bold block">
              03 // REAL-TIME DECISION DEMONSTRATION
            </span>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-[#E8E3D5] tracking-tight uppercase">
              FROM SIGNAL <br />
              <span className="italic font-serif text-[#C7A45A]">TO ACTION.</span>
            </h2>
            <p className="font-mono text-sm sm:text-base text-[#9A9D91] leading-relaxed pt-2">
              Watch how FarmFlow evaluates a real field situation and produces an optimal decision.
            </p>
          </div>

          {/* 1. LIVE FIELD SIGNAL */}
          <div className="p-6 bg-[#101510]/90 border border-[#1A241B] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A241B]">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6F956B] animate-pulse" />
                <span className="font-mono text-xs sm:text-sm font-bold text-[#6F956B] tracking-[0.2em] uppercase">
                  LIVE FIELD SIGNAL
                </span>
              </div>
              <span className="font-mono text-xs text-[#6F956B] font-bold tracking-widest uppercase">
                ● TELEMETRY STREAM
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs sm:text-sm">
              <div className="p-4 bg-[#080B08] border border-[#1A241B]">
                <span className="text-[#9A9D91] block text-[10px] uppercase tracking-wider mb-1">SOIL STATUS</span>
                <strong className="text-[#E8E3D5] text-sm sm:text-base font-bold">42% SOIL MOISTURE</strong>
              </div>
              <div className="p-4 bg-[#080B08] border border-[#315F38]">
                <span className="text-[#6F956B] block text-[10px] uppercase tracking-wider mb-1">RADAR FORECAST</span>
                <strong className="text-[#6F956B] text-sm sm:text-base font-bold">85% RAIN CHANCE</strong>
              </div>
              <div className="p-4 bg-[#080B08] border border-[#1A241B]">
                <span className="text-[#9A9D91] block text-[10px] uppercase tracking-wider mb-1">CROP TYPE</span>
                <strong className="text-[#E8E3D5] text-sm sm:text-base font-bold">RICE</strong>
              </div>
              <div className="p-4 bg-[#080B08] border border-[#1A241B]">
                <span className="text-[#9A9D91] block text-[10px] uppercase tracking-wider mb-1">GROWTH STAGE</span>
                <strong className="text-[#C7A45A] text-sm sm:text-base font-bold">VEGETATIVE STAGE</strong>
              </div>
            </div>
          </div>

          {/* 2. SITUATION DEVELOPMENT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#101510] border border-[#1A241B]">
              <span className="font-mono text-[10px] text-[#9A9D91] tracking-widest uppercase block mb-2 font-semibold">
                FIELD CONDITION
              </span>
              <p className="font-mono text-base text-[#E8E3D5] font-semibold">
                Soil moisture is low.
              </p>
            </div>

            <div className="p-6 bg-[#101510] border border-[#315F38]">
              <span className="font-mono text-[10px] text-[#6F956B] tracking-widest uppercase block mb-2 font-bold">
                WEATHER SIGNAL
              </span>
              <p className="font-mono text-base text-[#6F956B] font-bold">
                Rain probability is high.
              </p>
            </div>

            <div className="p-6 bg-[#102B18]/60 border border-[#6F956B]">
              <span className="font-mono text-[10px] text-[#C7A45A] tracking-widest uppercase block mb-2 font-bold">
                DECISION
              </span>
              <p className="font-mono text-base text-[#C7A45A] font-bold">
                Irrigation can wait.
              </p>
            </div>
          </div>

          {/* 3. MAIN VISUAL FOCUS: FARMFLOW DECISION */}
          <div className="p-8 sm:p-14 bg-[#102B18]/95 backdrop-blur-md border-2 border-[#6F956B] shadow-[0_0_50px_rgba(111,149,107,0.35)] max-w-3xl mx-auto text-center space-y-4">
            <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.3em] uppercase font-bold block">
              FARMFLOW DECISION
            </span>
            
            <h3 className="font-display text-5xl sm:text-7xl text-[#E8E3D5] font-bold tracking-tight">
              DELAY IRRIGATION
            </h3>

            <p className="font-mono text-sm sm:text-base text-[#9A9D91]">
              Rain is likely. No immediate irrigation required.
            </p>
          </div>

          {/* 4. WHY THIS DECISION? */}
          <div className="p-8 bg-[#101510] border border-[#1A241B] max-w-3xl mx-auto text-center space-y-6">
            <span className="font-mono text-xs sm:text-sm text-[#C7A45A] tracking-[0.25em] uppercase font-bold block">
              WHY?
            </span>

            {/* Reasoning chain */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-sm sm:text-base font-bold text-[#E8E3D5]">
              <span className="px-4 py-2 bg-[#080B08] border border-[#1A241B] text-[#9A9D91]">LOW SOIL MOISTURE</span>
              <span className="text-[#6F956B] text-xl">+</span>
              <span className="px-4 py-2 bg-[#080B08] border border-[#315F38] text-[#6F956B]">HIGH RAIN PROBABILITY</span>
              <span className="text-[#C7A45A] text-xl">↓</span>
              <span className="px-5 py-2 bg-[#102B18] border border-[#6F956B] text-[#C7A45A] shadow-md">IRRIGATION DELAYED</span>
            </div>
          </div>

          {/* 5. MEASURABLE RESULT */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-center">
              <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.2em] uppercase font-bold">
                MEASURABLE RESULT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-center">
              <div className="p-6 bg-[#101510] border border-[#1A241B]">
                <div className="font-display text-4xl sm:text-5xl text-[#6F956B] font-bold">
                  1,620 L
                </div>
                <span className="text-xs text-[#9A9D91] tracking-[0.18em] uppercase font-semibold mt-2 block">
                  WATER SAVED
                </span>
              </div>

              <div className="p-6 bg-[#101510] border border-[#1A241B]">
                <div className="font-display text-4xl sm:text-5xl text-[#C7A45A] font-bold">
                  ₹1,850
                </div>
                <span className="text-xs text-[#9A9D91] tracking-[0.18em] uppercase font-semibold mt-2 block">
                  COST AVOIDED
                </span>
              </div>

              <div className="p-6 bg-[#101510] border border-[#1A241B]">
                <div className="font-display text-4xl sm:text-5xl text-[#E8E3D5] font-bold">
                  2.5 HRS
                </div>
                <span className="text-xs text-[#9A9D91] tracking-[0.18em] uppercase font-semibold mt-2 block">
                  TIME SAVED
                </span>
              </div>
            </div>
          </div>

        </section>

        {/* =========================================================================
            SECTION: BEFORE VS AFTER IMPACT COMPARISON
            ========================================================================= */}
        <section id="comparison" className="py-20 border-b border-[#1A241B]">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.25em] uppercase font-bold block">
              BEFORE VS AFTER // DECISION IMPACT
            </span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#E8E3D5] tracking-tight uppercase">
              ONE DECISION. ONE SAVED ACTION.
            </h2>
            <p className="font-mono text-sm sm:text-base text-[#9A9D91] leading-relaxed">
              See how FarmFlow turns farm conditions into smarter actions.
            </p>
          </div>

          {/* Premium Two-Column Comparison Card */}
          <div className="max-w-[860px] mx-auto bg-[#101510]/95 backdrop-blur-md border border-[#1A241B] shadow-[0_0_50px_rgba(0,0,0,0.7)] p-6 sm:p-10 space-y-8">
            
            {/* Two-Column Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* LEFT COLUMN: WITHOUT FARMFLOW */}
              <div className="p-6 bg-[#080B08] border border-[#1A241B] flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#1A241B]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8F3E3E]" />
                    <h3 className="font-mono text-xs sm:text-sm font-bold tracking-[0.18em] text-[#8F3E3E] uppercase">
                      WITHOUT FARMFLOW
                    </h3>
                  </div>

                  <ul className="space-y-4 font-mono text-xs sm:text-sm text-[#9A9D91]">
                    <li className="flex items-center justify-between pb-3 border-b border-[#1A241B]/50">
                      <span>Condition / Action</span>
                      <strong className="text-[#E8E3D5] font-semibold">Irrigation required</strong>
                    </li>
                    <li className="flex items-center justify-between pb-3 border-b border-[#1A241B]/50">
                      <span>Estimated Expense</span>
                      <strong className="text-[#8F3E3E] font-semibold">₹1,850 estimated cost</strong>
                    </li>
                    <li className="flex items-center justify-between pb-3 border-b border-[#1A241B]/50">
                      <span>Execution Timing</span>
                      <strong className="text-[#E8E3D5] font-semibold">Immediate action</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Resource Outcome</span>
                      <strong className="text-[#8F3E3E] font-semibold">Water consumed unnecessarily</strong>
                    </li>
                  </ul>
                </div>
              </div>

              {/* RIGHT COLUMN: WITH FARMFLOW */}
              <div className="p-6 bg-[#102B18]/70 border-2 border-[#315F38] shadow-[0_0_25px_rgba(49,95,56,0.25)] flex flex-col justify-between space-y-6 relative">
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#6F956B] text-[#080B08] font-mono text-[10px] font-bold tracking-widest uppercase">
                  OPTIMIZED
                </div>

                <div>
                  <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#315F38]/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6F956B] animate-pulse" />
                    <h3 className="font-mono text-xs sm:text-sm font-bold tracking-[0.18em] text-[#6F956B] uppercase">
                      WITH FARMFLOW
                    </h3>
                  </div>

                  <ul className="space-y-4 font-mono text-xs sm:text-sm text-[#E8E3D5]">
                    <li className="flex items-center justify-between pb-3 border-b border-[#315F38]/40">
                      <span className="text-[#9A9D91]">Intelligence Signal</span>
                      <strong className="text-[#6F956B] font-bold">Rain likely</strong>
                    </li>
                    <li className="flex items-center justify-between pb-3 border-b border-[#315F38]/40">
                      <span className="text-[#9A9D91]">Autonomous Decision</span>
                      <strong className="text-[#E8E3D5] font-bold">Irrigation delayed</strong>
                    </li>
                    <li className="flex items-center justify-between pb-3 border-b border-[#315F38]/40">
                      <span className="text-[#9A9D91]">Economic Benefit</span>
                      <strong className="text-[#C7A45A] font-bold">₹1,850 potential cost avoided</strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-[#9A9D91]">Resource Outcome</span>
                      <strong className="text-[#6F956B] font-bold">Water preserved</strong>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Bottom Concise Explanation */}
            <div className="pt-4 border-t border-[#1A241B] text-center space-y-3">
              <p className="font-mono text-xs sm:text-sm text-[#9A9D91] leading-relaxed">
                Low soil moisture + high rain probability → FarmFlow delays irrigation instead of wasting water.
              </p>

              {/* Small Result Strip */}
              <div className="py-2.5 px-4 bg-[#080B08] border border-[#1A241B] font-mono text-xs sm:text-sm font-semibold tracking-wider text-[#C7A45A] uppercase flex flex-wrap items-center justify-center gap-3">
                <span>₹1,850 POTENTIAL COST AVOIDED</span>
                <span className="text-[#315F38]">•</span>
                <span className="text-[#6F956B]">WATER PRESERVED</span>
                <span className="text-[#315F38]">•</span>
                <span className="text-[#E8E3D5]">UNNECESSARY IRRIGATION AVOIDED</span>
              </div>
            </div>

          </div>
        </section>


        {/* =========================================================================
            SECTION: MEASURED FARMFLOW IMPACT (BUSINESS & ENVIRONMENTAL VALUE)
            ========================================================================= */}
        <section id="impact" className="py-24 border-b border-[#1A241B]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="font-mono text-xs sm:text-sm text-[#C7A45A] tracking-[0.25em] uppercase block mb-3 font-semibold">
                04 / MEASURED IMPACT
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#E8E3D5]">
                MEASURABLE VALUE. <br />
                <span className="italic font-serif text-[#C7A45A]">PROVEN RESULTS.</span>
              </h2>
            </div>
            <p className="text-sm text-[#9A9D91] font-mono max-w-md">
              Quantifiable financial, water, and crop savings generated autonomously across every stage of the farm-to-market cycle.
            </p>
          </div>

          {/* Premium High-Signal Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono">
            {/* Card 1 */}
            <div className="p-7 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[140px] hover:border-[#C7A45A]/50 transition-colors">
              <span className="text-xs sm:text-sm text-[#9A9D91] tracking-[0.18em] uppercase font-semibold">VALUE RECOVERED</span>
              <div className="font-display text-4xl sm:text-5xl text-[#C7A45A] font-bold my-2">
                ₹13,050
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-7 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[140px] hover:border-[#6F956B]/50 transition-colors">
              <span className="text-xs sm:text-sm text-[#9A9D91] tracking-[0.18em] uppercase font-semibold">WATER SAVED</span>
              <div className="font-display text-4xl sm:text-5xl text-[#6F956B] font-bold my-2">
                1,620 <span className="font-mono text-base text-[#9A9D91] font-normal">L</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-7 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[140px] hover:border-[#315F38] transition-colors">
              <span className="text-xs sm:text-sm text-[#9A9D91] tracking-[0.18em] uppercase font-semibold">TIME SAVED</span>
              <div className="font-display text-4xl sm:text-5xl text-[#E8E3D5] font-bold my-2">
                2.5 <span className="font-mono text-base text-[#9A9D91] font-normal">HRS</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-7 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[140px] hover:border-[#6F956B]/50 transition-colors">
              <span className="text-xs sm:text-sm text-[#9A9D91] tracking-[0.18em] uppercase font-semibold">PRODUCE RESCUED</span>
              <div className="font-display text-4xl sm:text-5xl text-[#6F956B] font-bold my-2">
                290 <span className="font-mono text-base text-[#9A9D91] font-normal">KG</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="p-7 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[140px] hover:border-[#315F38] transition-colors">
              <span className="text-xs sm:text-sm text-[#9A9D91] tracking-[0.18em] uppercase font-semibold">WASTE AVOIDED</span>
              <div className="font-display text-4xl sm:text-5xl text-[#E8E3D5] font-bold my-2">
                700 <span className="font-mono text-base text-[#9A9D91] font-normal">KG</span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="p-7 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[140px] hover:border-[#C7A45A]/50 transition-colors">
              <span className="text-xs sm:text-sm text-[#9A9D91] tracking-[0.18em] uppercase font-semibold">ESTIMATED YIELD</span>
              <div className="font-display text-4xl sm:text-5xl text-[#C7A45A] font-bold my-2">
                11,758 <span className="font-mono text-base text-[#9A9D91] font-normal">KG</span>
              </div>
            </div>

            {/* Card 7 */}
            <div className="p-7 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[140px] col-span-2 hover:border-[#6F956B]/50 transition-colors">
              <span className="text-xs sm:text-sm text-[#9A9D91] tracking-[0.18em] uppercase font-semibold">ESTIMATED FARMER BENEFIT</span>
              <div className="font-display text-4xl sm:text-5xl text-[#6F956B] font-bold my-2">
                ₹18,400 <span className="font-mono text-xs text-[#9A9D91] font-normal tracking-normal">/ harvest cycle</span>
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
