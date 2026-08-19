import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FieldBackground from '../components/FieldBackground';
import FarmImpactKPI from '../components/FarmImpactKPI';
import SmartCropRotation from '../components/SmartCropRotation';

// Supported options from backend
const SUPPORTED_CROPS = [
  'Tomato',
  'Potato',
  'Onion',
  'Wheat',
  'Rice',
  'Maize',
  'Cotton',
  'Sugarcane',
  'Soybean',
  'Chili',
];

const SUPPORTED_STAGES = [
  'Seedling',
  'Vegetative',
  'Flowering',
  'Fruiting',
  'Ripening',
  'Harvest',
];

// Quick Scenarios — Interactive AI Simulation Controls
const QUICK_SCENARIOS = [
  {
    id: 'monsoon-storm',
    name: 'MONSOON STORM',
    desc: 'Monsoon Storm → increases rain probability',
    impact: 'Rain probability → 85%',
    accentColor: '#6F956B',
    data: {
      crop: 'Rice',
      crop_stage: 'Vegetative',
      temperature: 28,
      humidity: 88,
      soil_moisture: 58,
      rain_probability: 85,
      wind_speed: 26,
      market_demand: 4500,
    },
  },
  {
    id: 'mandi-shift',
    name: 'MANDI DEMAND SHIFT',
    desc: 'Mandi Demand Shift → changes buyer demand',
    impact: 'Buyer demand → 2,800 KG',
    accentColor: '#C7A45A',
    data: {
      crop: 'Rice',
      crop_stage: 'Vegetative',
      temperature: 32,
      humidity: 72,
      soil_moisture: 42,
      rain_probability: 25,
      wind_speed: 12,
      market_demand: 2800,
    },
  },
  {
    id: 'dry-field',
    name: 'DRY FIELD HEATWAVE',
    desc: 'Dry Field → triggers urgent irrigation',
    impact: 'Soil moisture → 18%',
    accentColor: '#6F956B',
    data: {
      crop: 'Rice',
      crop_stage: 'Vegetative',
      temperature: 42,
      humidity: 28,
      soil_moisture: 18,
      rain_probability: 10,
      wind_speed: 20,
      market_demand: 4500,
    },
  },
  {
    id: 'baseline-reset',
    name: 'RESET BASELINE',
    desc: 'Returns everything to original farm state',
    impact: 'Baseline Telemetry (Rain 85%, Demand 4,500 KG)',
    accentColor: '#E8E3D5',
    data: {
      crop: 'Rice',
      crop_stage: 'Vegetative',
      temperature: 32,
      humidity: 72,
      soil_moisture: 28,
      rain_probability: 85,
      wind_speed: 12,
      market_demand: 4500,
    },
  },
];

const DEFAULT_FORM_VALUES = {
  crop: 'Rice',
  crop_stage: 'Vegetative',
  temperature: 32,
  humidity: 72,
  soil_moisture: 28,
  rain_probability: 85,
  wind_speed: 12,
  market_demand: 4500,
};

export default function TryDemo() {
  // Form State
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
  const [formErrors, setFormErrors] = useState({});
  const [activeScenarioId, setActiveScenarioId] = useState(null);

  // Execution States: 'idle' | 'running' | 'completed' | 'error'
  const [pipelineState, setPipelineState] = useState('idle');
  const [activeStep, setActiveStep] = useState(0); // 0 = idle, 1 = SENSE, 2 = PREDICT, 3 = MATCH, 4 = ACT
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submittedInput, setSubmittedInput] = useState(null);

  const resultsRef = useRef(null);

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.crop) errors.crop = 'Please select a crop';
    if (!formData.crop_stage) errors.crop_stage = 'Please select a crop stage';

    const temp = Number(formData.temperature);
    if (isNaN(temp) || temp < -10 || temp > 60) {
      errors.temperature = 'Must be between -10°C and 60°C';
    }

    const hum = Number(formData.humidity);
    if (isNaN(hum) || hum < 0 || hum > 100) {
      errors.humidity = 'Must be between 0% and 100%';
    }

    const soil = Number(formData.soil_moisture);
    if (isNaN(soil) || soil < 0 || soil > 100) {
      errors.soil_moisture = 'Must be between 0% and 100%';
    }

    const rain = Number(formData.rain_probability);
    if (isNaN(rain) || rain < 0 || rain > 100) {
      errors.rain_probability = 'Must be between 0% and 100%';
    }

    const wind = Number(formData.wind_speed);
    if (isNaN(wind) || wind < 0 || wind > 200) {
      errors.wind_speed = 'Must be between 0 and 200 km/h';
    }

    const demand = Number(formData.market_demand);
    if (isNaN(demand) || demand <= 0) {
      errors.market_demand = 'Must be a positive number (> 0 kg)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Quick Scenario Click
  const handleSelectScenario = (scenario) => {
    setFormData(scenario.data);
    setActiveScenarioId(scenario.id);
    setFormErrors({});
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setActiveScenarioId(null);
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'crop' || name === 'crop_stage' ? value : Number(value),
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Run Real 4-Agent Analysis against backend
  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      temperature: Number(formData.temperature),
      humidity: Number(formData.humidity),
      soil_moisture: Number(formData.soil_moisture),
      rain_probability: Number(formData.rain_probability),
      wind_speed: Number(formData.wind_speed),
      market_demand: Number(formData.market_demand),
      crop: formData.crop,
      crop_stage: formData.crop_stage,
    };

    setSubmittedInput(payload);
    setPipelineState('running');
    setActiveStep(1);
    setErrorMessage(null);

    // Timing sequence for smooth agent activation visual
    const t1 = setTimeout(() => setActiveStep(2), 700);
    const t2 = setTimeout(() => setActiveStep(3), 1400);
    const t3 = setTimeout(() => setActiveStep(4), 2100);

    try {
      // Call backend API
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

      if (!res || !res.ok) {
        const errorText = res ? await res.text() : 'Cannot connect to backend server at http://localhost:8000';
        throw new Error(errorText || 'Failed to execute 4-agent analysis');
      }

      const data = await res.json();

      // Complete execution after animation
      setTimeout(() => {
        setAnalysisResult(data);
        setPipelineState('completed');
        setActiveStep(4);
      }, 2800);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setPipelineState('error');
      setErrorMessage(err.message || 'Error connecting to API server.');
    }
  };

  // Reset to default
  const handleReset = () => {
    setFormData(DEFAULT_FORM_VALUES);
    setFormErrors({});
    setActiveScenarioId(null);
    setPipelineState('idle');
    setActiveStep(0);
    setAnalysisResult(null);
    setErrorMessage(null);
    setSubmittedInput(null);
  };

  // Auto-scroll to results on completion
  useEffect(() => {
    if (pipelineState === 'completed' && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [pipelineState]);

  const pipeline = analysisResult?.pipeline;
  const actionflow = analysisResult?.actionflow;

  return (
    <div className="min-h-screen bg-[#080B08] text-[#E8E3D5] relative selection:bg-[#315F38]/40 selection:text-[#E8E3D5]">
      <FieldBackground />
      <Navigation />

      <main className="relative z-10 pt-20 md:pt-24 pb-28 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">

        {/* =========================================================================
            1. HERO SECTION
            ========================================================================= */}
        <section className="py-10 md:py-14 border-b border-[#1A241B]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-3">
                <span className="w-2 h-2 bg-[#6F956B]" />
                <span className="font-mono text-[10px] sm:text-xs text-[#9A9D91] tracking-[0.25em] uppercase font-medium">
                  FARMFLOW // LIVE INTERACTIVE SYSTEM DEMO
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#E8E3D5] tracking-tight leading-none">
                Watch the Farm <br className="hidden sm:block" />
                <span className="italic font-serif text-[#6F956B]">Think.</span>
              </h1>

              {/* Supporting Text */}
              <p className="mt-4 text-sm sm:text-base text-[#9A9D91] font-sans max-w-2xl leading-relaxed">
                Enter any agricultural scenario or select a quick preset. Watch FarmFlow's four AI agents analyze the real-time data and synthesize an explainable decision.
              </p>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
              <div className="px-3.5 py-1.5 bg-[#101510] border border-[#1A241B] flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${pipelineState === 'error' ? 'bg-[#8F3E3E]' : 'bg-[#6F956B]'
                  } animate-status-dot`} />
                <span className="text-[#E8E3D5] text-[10px] tracking-wider uppercase font-medium">
                  {pipelineState === 'error' ? 'CONNECTION ERROR' : 'LIVE AGENT PIPELINE'}
                </span>
              </div>

              <div className="px-3.5 py-1.5 bg-[#101510] border border-[#1A241B] flex items-center gap-2">
                <span className="text-[#6F956B] text-[10px] tracking-wider uppercase font-semibold">
                  4 AGENTS // 1 DECISION
                </span>
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            2. SCENARIO BUILDER: QUICK PRESETS & MANUAL INPUT FORM
            ========================================================================= */}
        <section className="py-12 border-b border-[#1A241B]">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6 gap-2">
            <div>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-1">
                STEP 01 // CONFIGURE ENVIRONMENT
              </span>
              <h2 className="font-display text-3xl text-[#E8E3D5]">
                Farm Scenario Parameters
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#9A9D91] tracking-widest uppercase">
              ALL VALUES PROCESSED BY REAL BACKEND
            </span>
          </div>

          {/* Quick Scenario Presets */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-[#6F956B] tracking-[0.2em] uppercase font-bold">
                INTERACTIVE SCENARIO SIMULATION CONTROLS
              </span>
              <span className="font-mono text-xs text-[#9A9D91]">CLICK TO ACTIVATE STATE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {QUICK_SCENARIOS.map((sc) => {
                const isActive = activeScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleSelectScenario(sc)}
                    className={`p-6 text-left border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[165px] relative group ${
                      isActive
                        ? 'bg-[#102B18] border-2 border-[#6F956B] text-[#E8E3D5] shadow-[0_0_25px_rgba(111,149,107,0.3)]'
                        : 'bg-[#101510] border-[#1A241B] text-[#9A9D91] hover:border-[#315F38] hover:bg-[#141C14] hover:text-[#E8E3D5]'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-3 right-3 px-2 py-0.5 bg-[#C7A45A] text-[#080B08] text-[9px] font-bold tracking-widest uppercase font-mono rounded-sm shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#080B08] animate-pulse" />
                        ACTIVE SIMULATION
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-lg sm:text-xl font-bold text-[#E8E3D5] tracking-wide">
                          {sc.name}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-[#9A9D91] leading-relaxed mb-3">
                        {sc.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#1A241B]/80 flex items-center justify-between font-mono text-xs">
                      <span className="font-bold text-[#C7A45A]">{sc.impact}</span>
                      <span className="text-[#6F956B] group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Manual Form */}
          <form onSubmit={handleRunAnalysis} className="p-6 sm:p-10 bg-[#101510] border border-[#1A241B] space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Crop Dropdown */}
              <div>
                <label className="block font-mono text-xs text-[#9A9D91] tracking-widest uppercase mb-2 font-semibold">
                  Target Crop *
                </label>
                <select
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#080B08] border border-[#1A241B] focus:border-[#6F956B] text-[#E8E3D5] font-mono text-sm sm:text-base rounded-none outline-none"
                >
                  {SUPPORTED_CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {formErrors.crop && <span className="font-mono text-xs text-[#8F3E3E] mt-1 block">{formErrors.crop}</span>}
              </div>

              {/* Crop Stage Dropdown */}
              <div>
                <label className="block font-mono text-xs text-[#9A9D91] tracking-widest uppercase mb-2 font-semibold">
                  Growth Stage *
                </label>
                <select
                  name="crop_stage"
                  value={formData.crop_stage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#080B08] border border-[#1A241B] focus:border-[#6F956B] text-[#E8E3D5] font-mono text-sm sm:text-base rounded-none outline-none"
                >
                  {SUPPORTED_STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {formErrors.crop_stage && <span className="font-mono text-xs text-[#8F3E3E] mt-1 block">{formErrors.crop_stage}</span>}
              </div>

              {/* Temperature */}
              <div>
                <label className="block font-mono text-xs text-[#9A9D91] tracking-widest uppercase mb-2 font-semibold">
                  Temperature (°C) *
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  min="-10"
                  max="60"
                  step="1"
                  className="w-full px-4 py-3 bg-[#080B08] border border-[#1A241B] focus:border-[#6F956B] text-[#E8E3D5] font-mono text-sm sm:text-base rounded-none outline-none"
                />
                {formErrors.temperature && <span className="font-mono text-xs text-[#8F3E3E] mt-1 block">{formErrors.temperature}</span>}
              </div>

              {/* Humidity */}
              <div>
                <label className="block font-mono text-xs text-[#9A9D91] tracking-widest uppercase mb-2 font-semibold">
                  Humidity (%) *
                </label>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full px-4 py-3 bg-[#080B08] border border-[#1A241B] focus:border-[#6F956B] text-[#E8E3D5] font-mono text-sm sm:text-base rounded-none outline-none"
                />
                {formErrors.humidity && <span className="font-mono text-xs text-[#8F3E3E] mt-1 block">{formErrors.humidity}</span>}
              </div>

              {/* Soil Moisture */}
              <div>
                <label className="block font-mono text-xs text-[#9A9D91] tracking-widest uppercase mb-2 font-semibold">
                  Soil Moisture (%) * <span className="text-[#C7A45A] text-[10px]">Threshold: 35%</span>
                </label>
                <input
                  type="number"
                  name="soil_moisture"
                  value={formData.soil_moisture}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full px-4 py-3 bg-[#080B08] border border-[#1A241B] focus:border-[#6F956B] text-[#E8E3D5] font-mono text-sm sm:text-base rounded-none outline-none"
                />
                {formErrors.soil_moisture && <span className="font-mono text-xs text-[#8F3E3E] mt-1 block">{formErrors.soil_moisture}</span>}
              </div>

              {/* Rain Probability */}
              <div>
                <label className="block font-mono text-xs text-[#9A9D91] tracking-widest uppercase mb-2 font-semibold">
                  Rain Probability (%) * <span className="text-[#6F956B] text-[10px]">Threshold: 50%</span>
                </label>
                <input
                  type="number"
                  name="rain_probability"
                  value={formData.rain_probability}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full px-4 py-3 bg-[#080B08] border border-[#1A241B] focus:border-[#6F956B] text-[#E8E3D5] font-mono text-sm sm:text-base rounded-none outline-none"
                />
                {formErrors.rain_probability && <span className="font-mono text-xs text-[#8F3E3E] mt-1 block">{formErrors.rain_probability}</span>}
              </div>

              {/* Wind Speed */}
              <div>
                <label className="block font-mono text-xs text-[#9A9D91] tracking-widest uppercase mb-2 font-semibold">
                  Wind Speed (km/h) *
                </label>
                <input
                  type="number"
                  name="wind_speed"
                  value={formData.wind_speed}
                  onChange={handleChange}
                  min="0"
                  max="200"
                  step="1"
                  className="w-full px-4 py-3 bg-[#080B08] border border-[#1A241B] focus:border-[#6F956B] text-[#E8E3D5] font-mono text-sm sm:text-base rounded-none outline-none"
                />
                {formErrors.wind_speed && <span className="font-mono text-xs text-[#8F3E3E] mt-1 block">{formErrors.wind_speed}</span>}
              </div>

              {/* Market Demand */}
              <div>
                <label className="block font-mono text-xs text-[#9A9D91] tracking-widest uppercase mb-2 font-semibold">
                  Market Demand (kg) *
                </label>
                <input
                  type="number"
                  name="market_demand"
                  value={formData.market_demand}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  placeholder="e.g. 4500"
                  className="w-full px-3.5 py-2.5 bg-[#080B08] border border-[#1A241B] focus:border-[#6F956B] text-[#E8E3D5] font-mono text-xs rounded-none outline-none"
                />
                <span className="text-[10px] text-[#9A9D91] font-sans block mt-1">Expected market demand for this crop.</span>
                {formErrors.market_demand && <span className="font-mono text-[10px] text-[#8F3E3E] mt-1 block">{formErrors.market_demand}</span>}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  disabled={pipelineState === 'running'}
                  className="w-full py-3.5 px-6 bg-[#102B18] border border-[#315F38] hover:bg-[#315F38] hover:border-[#6F956B] disabled:opacity-50 text-[#E8E3D5] font-mono text-xs tracking-[0.2em] uppercase font-semibold transition-all shadow-[0_0_20px_rgba(49,95,56,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {pipelineState === 'running' ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-[#6F956B] animate-ping" />
                      <span>ANALYZING...</span>
                    </>
                  ) : (
                    <>
                      <span>RUN FARMFLOW ANALYSIS</span>
                      <span className="text-[#6F956B]">→</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </section>


        {/* =========================================================================
            3. ERROR STATE (IF BACKEND UNREACHABLE)
            ========================================================================= */}
        {pipelineState === 'error' && (
          <div className="my-8 p-6 bg-[#2B1010] border border-[#8F3E3E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-feed-item">
            <div>
              <span className="font-mono text-xs text-[#E8E3D5] font-bold block mb-1">
                ⚠️ API ANALYSIS FAILED
              </span>
              <p className="font-mono text-[11px] text-[#E8E3D5]/80">
                {errorMessage}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRunAnalysis}
                className="px-5 py-2.5 bg-[#8F3E3E] text-[#E8E3D5] font-mono text-xs tracking-wider uppercase font-semibold hover:bg-[#A34E4E] transition-all cursor-pointer"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}


        {/* =========================================================================
            4. FOUR-PHASE SEQUENTIAL PIPELINE VISUALIZATION
            ========================================================================= */}
        <section className="py-14 border-b border-[#1A241B]">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 gap-3">
            <div>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-1">
                STEP 02 // MULTI-AGENT EXECUTION LOOP
              </span>
              <h2 className="font-display text-3xl sm:text-4xl text-[#E8E3D5]">
                The Four Intelligence Stages
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#9A9D91] tracking-widest uppercase">
              SENSE → PREDICT → MATCH → ACT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">

            {/* ── CARD 01: SENSE — நிலம் (FarmSense) ── */}
            <div className={`p-6 bg-[#101510] border transition-all duration-500 flex flex-col justify-between min-h-[380px] relative ${activeStep === 1 && pipelineState === 'running' ? 'border-[#6F956B] bg-[#102B18]/40 shadow-[0_0_30px_rgba(49,95,56,0.3)] ring-1 ring-[#6F956B]' :
                activeStep >= 1 && pipeline ? 'border-[#315F38]' : 'border-[#1A241B]'
              }`}>
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1A241B]">
                  <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.2em] uppercase font-bold">
                    PHASE 01 // SENSE
                  </span>
                  <span className={`font-mono text-[9px] px-2 py-0.5 border ${activeStep === 1 && pipelineState === 'running' ? 'border-[#6F956B] text-[#6F956B] bg-[#102B18] animate-pulse' :
                      pipeline ? 'border-[#315F38] text-[#6F956B]' : 'border-[#1A241B] text-[#9A9D91]'
                    }`}>
                    {activeStep === 1 && pipelineState === 'running' ? 'ANALYZING...' : pipeline ? 'COMPLETE ✓' : 'STANDBY'}
                  </span>
                </div>

                <h3 className="font-tamil text-4xl text-[#E8E3D5] tracking-wide font-normal">
                  நிலம்
                </h3>
                <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block font-semibold mt-0.5">
                  FARMSENSE
                </span>
                <p className="text-[11px] font-mono text-[#9A9D91] mt-2">
                  Reads soil + weather conditions
                </p>
              </div>

              <div className="pt-4 border-t border-[#1A241B] space-y-2">
                <span className="font-mono text-[9px] text-[#9A9D91] tracking-widest uppercase block">
                  {pipeline ? 'LIVE EVALUATED DECISION' : 'STAGE FOCUS'}
                </span>

                {!pipeline ? (
                  <div className="font-mono text-xs text-[#9A9D91]/60">
                    Soil moisture & precipitation matching.
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-feed-item">
                    <div className={`font-mono text-sm font-bold ${pipeline.farmsense.irrigation_decision === 'IRRIGATE' ? 'text-[#C7A45A]' :
                        pipeline.farmsense.irrigation_decision === 'DELAY' ? 'text-[#6F956B]' : 'text-[#E8E3D5]'
                      }`}>
                      {pipeline.farmsense.irrigation_decision}
                      {pipeline.farmsense.delay_hours > 0 ? ` (~${pipeline.farmsense.delay_hours}h delay)` : ''}
                    </div>
                    <div className="font-mono text-[11px] text-[#9A9D91]">
                      Water Saved: <span className="text-[#E8E3D5] font-semibold">{pipeline.farmsense.water_saved_l?.toLocaleString() || 0} L</span>
                    </div>
                    <div className="font-mono text-[10px] text-[#9A9D91] line-clamp-3">
                      {pipeline.farmsense.reason}
                    </div>
                  </div>
                )}
              </div>

              {activeStep === 1 && pipelineState === 'running' && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#6F956B] animate-pulse" />
              )}
            </div>


            {/* ── CARD 02: PREDICT — வளம் (CropGuard) ── */}
            <div className={`p-6 bg-[#101510] border transition-all duration-500 flex flex-col justify-between min-h-[380px] relative ${activeStep === 2 && pipelineState === 'running' ? 'border-[#6F956B] bg-[#102B18]/40 shadow-[0_0_30px_rgba(49,95,56,0.3)] ring-1 ring-[#6F956B]' :
                activeStep >= 2 && pipeline ? 'border-[#315F38]' : 'border-[#1A241B]'
              }`}>
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1A241B]">
                  <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.2em] uppercase font-bold">
                    PHASE 02 // PREDICT
                  </span>
                  <span className={`font-mono text-[9px] px-2 py-0.5 border ${activeStep === 2 && pipelineState === 'running' ? 'border-[#6F956B] text-[#6F956B] bg-[#102B18] animate-pulse' :
                      pipeline ? 'border-[#315F38] text-[#6F956B]' : 'border-[#1A241B] text-[#9A9D91]'
                    }`}>
                    {activeStep === 2 && pipelineState === 'running' ? 'PREDICTING...' : pipeline ? 'COMPLETE ✓' : 'WAITING FOR SENSE'}
                  </span>
                </div>

                <h3 className="font-tamil text-4xl text-[#E8E3D5] tracking-wide font-normal">
                  வளம்
                </h3>
                <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block font-semibold mt-0.5">
                  CROPGUARD
                </span>
                <p className="text-[11px] font-mono text-[#9A9D91] mt-2">
                  Predicts crop condition + yield
                </p>
              </div>

              <div className="pt-4 border-t border-[#1A241B] space-y-2">
                <span className="font-mono text-[9px] text-[#9A9D91] tracking-widest uppercase block">
                  {pipeline ? 'LIVE PREDICTION OUTPUT' : 'INPUT FROM நிலம்'}
                </span>

                {!pipeline ? (
                  <div className="font-mono text-xs text-[#9A9D91]/60">
                    Awaiting soil & weather signals.
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-feed-item">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#9A9D91]">Health Score:</span>
                      <span className="font-mono text-sm font-bold text-[#6F956B]">{pipeline.cropguard.crop_health}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#9A9D91]">Stress Level:</span>
                      <span className={`font-mono text-[11px] font-bold ${pipeline.cropguard.stress_level === 'HIGH' ? 'text-[#8F3E3E]' :
                          pipeline.cropguard.stress_level === 'MODERATE' ? 'text-[#C7A45A]' : 'text-[#6F956B]'
                        }`}>{pipeline.cropguard.stress_level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#9A9D91]">Expected Yield:</span>
                      <span className="font-mono text-sm font-bold text-[#C7A45A]">{pipeline.cropguard.expected_yield_kg} KG</span>
                    </div>
                    <div className="font-mono text-[10px] text-[#9A9D91] pt-1">
                      Harvest: {pipeline.cropguard.harvest_window} • Disease: {pipeline.cropguard.disease_risk}
                    </div>
                  </div>
                )}
              </div>

              {activeStep === 2 && pipelineState === 'running' && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#6F956B] animate-pulse" />
              )}
            </div>


            {/* ── CARD 03: MATCH — சந்தை (MarketMind) ── */}
            <div className={`p-6 bg-[#101510] border transition-all duration-500 flex flex-col justify-between min-h-[380px] relative ${activeStep === 3 && pipelineState === 'running' ? 'border-[#C7A45A] bg-[#2B2310]/40 shadow-[0_0_30px_rgba(199,164,90,0.3)] ring-1 ring-[#C7A45A]' :
                activeStep >= 3 && pipeline ? 'border-[#315F38]' : 'border-[#1A241B]'
              }`}>
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1A241B]">
                  <span className="font-mono text-[10px] text-[#C7A45A] tracking-[0.2em] uppercase font-bold">
                    PHASE 03 // MATCH
                  </span>
                  <span className={`font-mono text-[9px] px-2 py-0.5 border ${activeStep === 3 && pipelineState === 'running' ? 'border-[#C7A45A] text-[#C7A45A] bg-[#2B2310] animate-pulse' :
                      pipeline ? 'border-[#315F38] text-[#6F956B]' : 'border-[#1A241B] text-[#9A9D91]'
                    }`}>
                    {activeStep === 3 && pipelineState === 'running' ? 'MATCHING...' : pipeline ? 'COMPLETE ✓' : 'WAITING FOR PREDICT'}
                  </span>
                </div>

                <h3 className="font-tamil text-4xl text-[#E8E3D5] tracking-wide font-normal">
                  சந்தை
                </h3>
                <span className="font-mono text-[10px] text-[#C7A45A] tracking-[0.25em] uppercase block font-semibold mt-0.5">
                  MARKETMIND
                </span>
                <p className="text-[11px] font-mono text-[#9A9D91] mt-2">
                  Matches harvest with demand
                </p>
              </div>

              <div className="pt-4 border-t border-[#1A241B] space-y-2">
                <span className="font-mono text-[9px] text-[#9A9D91] tracking-widest uppercase block">
                  {pipeline ? 'LIVE MARKET BALANCING' : 'INPUT FROM வளம்'}
                </span>

                {!pipeline ? (
                  <div className="font-mono text-xs text-[#9A9D91]/60">
                    Awaiting yield predictions.
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-feed-item">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#9A9D91]">Perishable Surplus:</span>
                      <span className="font-mono text-sm font-bold text-[#C7A45A]">{pipeline.marketmind.surplus_kg} KG</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#9A9D91]">Food Rescued:</span>
                      <span className="font-mono text-[11px] font-semibold text-[#6F956B]">{pipeline.marketmind.food_rescued_kg} KG</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-[#9A9D91]">Value Preserved:</span>
                      <span className="font-mono text-[11px] font-bold text-[#E8E3D5]">₹{pipeline.marketmind.economic_value_recovered_inr?.toLocaleString()}</span>
                    </div>
                    <div className="font-mono text-[10px] text-[#9A9D91] pt-1">
                      Waste Risk: <span className="text-[#E8E3D5]">{pipeline.marketmind.waste_risk_level}</span>
                    </div>
                  </div>
                )}
              </div>

              {activeStep === 3 && pipelineState === 'running' && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#C7A45A] animate-pulse" />
              )}
            </div>


            {/* ── CARD 04: ACT — செயல் (ActionFlow) ── */}
            <div className={`p-6 bg-[#101510] border transition-all duration-500 flex flex-col justify-between min-h-[380px] relative ${activeStep === 4 && pipelineState === 'running' ? 'border-[#E8E3D5] bg-[#141C14] shadow-[0_0_35px_rgba(232,227,213,0.25)] ring-1 ring-[#E8E3D5]' :
                actionflow ? 'border-[#6F956B]/80 bg-[#141C14]' : 'border-[#1A241B]'
              }`}>
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1A241B]">
                  <span className="font-mono text-[10px] text-[#E8E3D5] tracking-[0.2em] uppercase font-bold">
                    PHASE 04 // ACT
                  </span>
                  <span className={`font-mono text-[9px] px-2 py-0.5 border ${activeStep === 4 && pipelineState === 'running' ? 'border-[#E8E3D5] text-[#E8E3D5] bg-[#1A241B] animate-pulse' :
                      actionflow ? 'border-[#6F956B] text-[#6F956B]' : 'border-[#1A241B] text-[#9A9D91]'
                    }`}>
                    {pipelineState === 'completed' ? 'SYNTHESIZED ✓' :
                      activeStep === 4 ? 'COORDINATING...' : 'WAITING FOR ALL'}
                  </span>
                </div>

                <h3 className="font-tamil text-4xl text-[#E8E3D5] tracking-wide font-normal">
                  செயல்
                </h3>
                <span className="font-mono text-[10px] text-[#E8E3D5] tracking-[0.25em] uppercase block font-semibold mt-0.5">
                  ACTIONFLOW
                </span>
                <p className="text-[11px] font-mono text-[#9A9D91] mt-2">
                  Coordinates the final response
                </p>
              </div>

              <div className="pt-4 border-t border-[#1A241B] space-y-2">
                <span className="font-mono text-[9px] text-[#9A9D91] tracking-widest uppercase block">
                  {actionflow ? 'COORDINATED OUTPUT' : 'INPUTS RECEIVED'}
                </span>

                {!actionflow ? (
                  <div className="space-y-1 font-mono text-[10px] text-[#9A9D91]">
                    <div>நிலம் (SENSE): {activeStep >= 1 ? '✓ COMPLETE' : '—'}</div>
                    <div>வளம் (PREDICT): {activeStep >= 2 ? '✓ COMPLETE' : '—'}</div>
                    <div>சந்தை (MATCH): {activeStep >= 3 ? '✓ COMPLETE' : '—'}</div>
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-feed-item">
                    <div className="font-mono text-sm font-bold text-[#E8E3D5]">
                      {actionflow.priority_actions?.length || 0} PRIORITIZED ACTIONS
                    </div>
                    <div className="font-mono text-[11px]">
                      Status: <span className={`font-bold ${actionflow.overall_status === 'CRITICAL' ? 'text-[#8F3E3E]' :
                          actionflow.overall_status === 'ATTENTION_REQUIRED' ? 'text-[#C7A45A]' : 'text-[#6F956B]'
                        }`}>{actionflow.overall_status?.replace('_', ' ')}</span>
                    </div>
                    <div className="font-mono text-[10px] text-[#9A9D91] line-clamp-2">
                      {actionflow.overall_reason}
                    </div>
                  </div>
                )}
              </div>

              {activeStep === 4 && pipelineState === 'running' && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#E8E3D5] animate-pulse" />
              )}
            </div>

          </div>
        </section>


        {/* =========================================================================
            5. INPUT vs OUTPUT COMPACT COMPARISON STRIP
            ========================================================================= */}
        {actionflow && submittedInput && (
          <section className="py-8 border-b border-[#1A241B] animate-feed-item">
            <div className="p-6 bg-[#101510] border border-[#1A241B] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

              {/* Input summary */}
              <div className="lg:col-span-5 space-y-2">
                <span className="font-mono text-[9px] text-[#6F956B] tracking-widest uppercase font-bold block">
                  SCENARIO INPUT TELEMETRY & DEMAND
                </span>
                <div className="font-mono text-xs text-[#E8E3D5] flex flex-wrap gap-x-4 gap-y-1">
                  <span>{submittedInput.crop} ({submittedInput.crop_stage})</span>
                  <span>{submittedInput.temperature}°C</span>
                  <span>{submittedInput.humidity}% Hum</span>
                  <span>{submittedInput.soil_moisture}% Soil</span>
                  <span>{submittedInput.rain_probability}% Rain</span>
                  <span>{submittedInput.wind_speed} km/h</span>
                  <span>Demand: <strong className="text-[#C7A45A]">{submittedInput.market_demand?.toLocaleString()} kg</strong></span>
                </div>
              </div>

              {/* Arrow divider */}
              <div className="lg:col-span-2 flex justify-center text-[#6F956B] font-mono text-xl font-bold">
                →
              </div>

              {/* Output summary */}
              <div className="lg:col-span-5 space-y-2">
                <span className="font-mono text-[9px] text-[#C7A45A] tracking-widest uppercase font-bold block">
                  COORDINATED OUTPUT
                </span>
                <div className="font-mono text-xs text-[#E8E3D5] flex flex-wrap gap-x-4 gap-y-1">
                  <span>Irrigation: <strong className="text-[#6F956B]">{pipeline?.farmsense?.irrigation_decision}</strong></span>
                  <span>Stress: <strong className="text-[#C7A45A]">{pipeline?.cropguard?.stress_level}</strong></span>
                  <span>Yield: <strong>{pipeline?.cropguard?.expected_yield_kg} kg</strong></span>
                  <span>Surplus: <strong>{pipeline?.marketmind?.surplus_kg} kg</strong></span>
                  <span>Status: <strong className="text-[#E8E3D5]">{actionflow.overall_status}</strong></span>
                </div>
              </div>

            </div>
          </section>
        )}


        {/* =========================================================================
            6. FINAL ACTION PLAN (FARMFLOW DECISION)
            ========================================================================= */}
        {actionflow && (
          <section ref={resultsRef} className="py-14 border-b border-[#1A241B] animate-feed-item">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.3em] uppercase block mb-1 font-medium">
                  FINAL SYNTHESIS // ACT STAGE
                </span>
                <h2 className="font-display text-4xl sm:text-5xl text-[#E8E3D5]">
                  FARMFLOW DECISION
                </h2>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-[#9A9D91]">OVERALL FARM STATUS:</span>
                <span className={`px-3 py-1 font-bold text-[11px] tracking-wider border ${actionflow.overall_status === 'CRITICAL' ? 'bg-[#2B1010] border-[#8F3E3E] text-[#8F3E3E]' :
                    actionflow.overall_status === 'ATTENTION_REQUIRED' ? 'bg-[#2B2310] border-[#C7A45A] text-[#C7A45A]' :
                      'bg-[#102B18] border-[#6F956B] text-[#6F956B]'
                  }`}>
                  {actionflow.overall_status?.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Action Cards */}
            <div className="space-y-4">
              {actionflow.priority_actions?.map((action, idx) => (
                <div
                  key={action.id || idx}
                  className="p-6 bg-[#101510] border border-[#1A241B] hover:border-[#315F38] transition-all grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  {/* Index Number */}
                  <div className="md:col-span-1 font-display text-3xl sm:text-4xl text-[#6F956B]">
                    0{action.priority || idx + 1}
                  </div>

                  {/* Main Instruction */}
                  <div className="md:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[9px] px-2 py-0.5 border ${action.urgency === 'HIGH' ? 'border-[#C7A45A] text-[#C7A45A]' :
                          action.urgency === 'LOW' ? 'border-[#1A241B] text-[#9A9D91]/60' :
                            'border-[#1A241B] text-[#9A9D91]'
                        }`}>
                        {action.urgency || 'MEDIUM'} PRIORITY
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

                  {/* Context + Source Agents */}
                  <div className="md:col-span-4">
                    <div className="font-mono text-[11px] text-[#9A9D91] leading-relaxed">
                      {action.reason || action.context}
                    </div>
                    {action.source_agents && action.source_agents.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[#1A241B]/50">
                        <span className="font-mono text-[8px] text-[#9A9D91]/60 tracking-widest uppercase mr-1">SOURCE</span>
                        {action.source_agents.map((agent) => (
                          <span
                            key={agent}
                            className={`font-mono text-[8px] px-1.5 py-0.5 tracking-wider uppercase ${agent === 'FARMSENSE' ? 'bg-[#102B18] text-[#6F956B] border border-[#1A241B]' :
                                agent === 'CROPGUARD' ? 'bg-[#102B18] text-[#6F956B] border border-[#1A241B]' :
                                  agent === 'MARKETMIND' ? 'bg-[#2B2310] text-[#C7A45A] border border-[#2B2310]' :
                                    'bg-[#101510] text-[#9A9D91] border border-[#1A241B]'
                              }`}
                          >
                            {agent === 'FARMSENSE' ? 'நிலம் (FARMSENSE)' :
                              agent === 'CROPGUARD' ? 'வளம் (CROPGUARD)' :
                                agent === 'MARKETMIND' ? 'சந்தை (MARKETMIND)' : agent}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* =========================================================================
            7. WHY THIS DECISION? TRACEABLE REASONING CHAIN
            ========================================================================= */}
        {actionflow && (
          <section className="py-14 border-b border-[#1A241B] animate-feed-item">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-1">
                  EXPLAINABLE AI ARCHITECTURE
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-[#E8E3D5]">
                  WHY THIS DECISION?
                </h2>
              </div>
              <span className="font-mono text-[10px] text-[#9A9D91] tracking-widest uppercase">
                DETERMINISTIC REASONING CHAIN
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Chain 1 */}
              <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between">
                <div>
                  <span className="font-mono text-2xl text-[#6F956B] font-display">01</span>
                  <h4 className="font-display text-lg text-[#E8E3D5] mt-2 mb-2">Environmental Sense</h4>
                  <p className="font-mono text-[11px] text-[#9A9D91] leading-relaxed">
                    Soil moisture at {submittedInput?.soil_moisture}% and rain forecast at {submittedInput?.rain_probability}%. FarmSense evaluates: {pipeline?.farmsense?.irrigation_decision} with {pipeline?.farmsense?.water_saved_l?.toLocaleString() || 0} L water conservation.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1A241B] font-mono text-[9px] text-[#6F956B]">
                  CONTRIBUTOR: நிலம் (FARMSENSE)
                </div>
              </div>

              {/* Chain 2 */}
              <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between">
                <div>
                  <span className="font-mono text-2xl text-[#6F956B] font-display">02</span>
                  <h4 className="font-display text-lg text-[#E8E3D5] mt-2 mb-2">Crop Health & Yield</h4>
                  <p className="font-mono text-[11px] text-[#9A9D91] leading-relaxed">
                    CropGuard computes a health index of {pipeline?.cropguard?.crop_health}/100 and stress level: {pipeline?.cropguard?.stress_level}. Forecasts total yield at {pipeline?.cropguard?.expected_yield_kg} KG.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1A241B] font-mono text-[9px] text-[#6F956B]">
                  CONTRIBUTOR: வளம் (CROPGUARD)
                </div>
              </div>

              {/* Chain 3 */}
              <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between">
                <div>
                  <span className="font-mono text-2xl text-[#C7A45A] font-display">03</span>
                  <h4 className="font-display text-lg text-[#E8E3D5] mt-2 mb-2">Market Demand Matching</h4>
                  <p className="font-mono text-[11px] text-[#9A9D91] leading-relaxed">
                    MarketMind balances the {pipeline?.cropguard?.expected_yield_kg} KG harvest against {submittedInput?.market_demand?.toLocaleString()} KG commercial demand, detecting {pipeline?.marketmind?.surplus_kg} KG surplus with {pipeline?.marketmind?.food_rescued_kg} KG routed to rescue.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1A241B] font-mono text-[9px] text-[#C7A45A]">
                  CONTRIBUTOR: சந்தை (MARKETMIND)
                </div>
              </div>

              {/* Chain 4 */}
              <div className="p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between">
                <div>
                  <span className="font-mono text-2xl text-[#E8E3D5] font-display">04</span>
                  <h4 className="font-display text-lg text-[#E8E3D5] mt-2 mb-2">Unified Prioritization</h4>
                  <p className="font-mono text-[11px] text-[#9A9D91] leading-relaxed">
                    ActionFlow unifies environmental, biological, and market signals into a prioritized action list, resolving conflicts between trade-offs.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1A241B] font-mono text-[9px] text-[#E8E3D5]">
                  ORCHESTRATOR: செயல் (ACTIONFLOW)
                </div>
              </div>

            </div>
          </section>
        )}


        {/* =========================================================================
            8. MEASURABLE FARM IMPACT & BUSINESS VALUE KPI
            ========================================================================= */}
        {actionflow && (
          <FarmImpactKPI pipeline={pipeline} submittedInput={submittedInput || {}} />
        )}


        {/* =========================================================================
            9. SMART CROP ROTATION RECOMMENDATION (DECISION SUPPORT)
            ========================================================================= */}
        {actionflow && (
          <SmartCropRotation crop={submittedInput?.crop || 'Rice'} telemetry={submittedInput || {}} />
        )}


        {/* =========================================================================
            8. FOOTER CONTROLS
            ========================================================================= */}
        <section className="pt-14 pb-4 text-center">
          <div className="font-mono text-xs text-[#6F956B] tracking-[0.3em] uppercase mb-2">
            SENSE • PREDICT • MATCH • ACT
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-[#E8E3D5] mb-8">
            Test Another Real Scenario
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-8 py-4 bg-[#102B18] border border-[#315F38] hover:bg-[#315F38] hover:border-[#6F956B] text-[#E8E3D5] font-mono text-xs sm:text-sm tracking-[0.2em] uppercase font-semibold transition-all cursor-pointer"
            >
              RUN ANOTHER SCENARIO
            </button>

            <Link
              to="/dashboard"
              className="px-8 py-4 bg-[#101510] border border-[#1A241B] hover:border-[#315F38] text-[#9A9D91] hover:text-[#E8E3D5] font-mono text-xs sm:text-sm tracking-[0.2em] uppercase transition-all"
            >
              ENTER COMMAND CENTER →
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A241B] py-8 text-center sm:text-left">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-[#9A9D91]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#315F38]" />
            <span>FARMFLOW AI // INTERACTIVE 4-AGENT CONTROL ROOM</span>
          </div>
          <div className="flex items-center gap-6">
            <span>REAL-TIME MULTI-AGENT ORCHESTRATION</span>
            <span>NO HARDCODED DATA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
