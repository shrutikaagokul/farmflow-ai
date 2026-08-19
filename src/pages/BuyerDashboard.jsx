import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FieldBackground from '../components/FieldBackground';

function getDemandLevelKg(val) {
  if (val <= 3000) return { label: 'LOW DEMAND', color: '#9A9D91', bg: 'bg-[#1A241B]' };
  if (val <= 5500) return { label: 'MODERATE DEMAND', color: '#6F956B', bg: 'bg-[#102B18]' };
  if (val <= 8000) return { label: 'HIGH DEMAND', color: '#C7A45A', bg: 'bg-[#2B2310]' };
  return { label: 'VERY HIGH DEMAND', color: '#E8E3D5', bg: 'bg-[#315F38]' };
}

export default function BuyerDashboard() {
  const [demandKg, setDemandKg] = useState(() => {
    const saved = localStorage.getItem('farmflow_buyer_demand_kg') || localStorage.getItem('farmflow_buyer_demand');
    if (saved !== null) {
      const parsed = Number(saved);
      return parsed <= 100 ? Math.round(1000 + (parsed / 100) * 9000) : parsed;
    }
    return 4500;
  });

  const levelInfo = getDemandLevelKg(demandKg);

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setDemandKg(val);
    localStorage.setItem('farmflow_buyer_demand_kg', val);
  };

  return (
    <div className="min-h-screen bg-[#080B08] text-[#E8E3D5] relative selection:bg-[#315F38]/40">
      <FieldBackground />
      <Navigation />

      <main className="relative z-10 pt-28 md:pt-36 pb-24 max-w-[800px] mx-auto px-6 text-center space-y-12">
        
        {/* Header */}
        <div className="space-y-2">
          <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.3em] uppercase font-bold block">
            BUYER DEMAND CONTROL
          </span>
          <h1 className="font-display text-4xl sm:text-6xl text-[#E8E3D5] tracking-tight">
            Buyer Demand
          </h1>
          <p className="font-mono text-sm text-[#9A9D91] max-w-md mx-auto">
            Adjust current market demand to see how FarmFlow responds.
          </p>
        </div>

        {/* Demand Slider Card (Hero Visual Centerpiece) */}
        <div className="p-8 sm:p-12 bg-[#101510]/90 backdrop-blur-md border border-[#315F38] shadow-[0_0_40px_rgba(49,95,56,0.15)] space-y-8">
          
          {/* Main KG Display */}
          <div className="space-y-2">
            <span className="font-mono text-xs sm:text-sm text-[#9A9D91] tracking-[0.2em] uppercase block font-semibold">
              CURRENT MARKET DEMAND
            </span>
            <div className="font-display text-5xl sm:text-7xl tracking-tight text-[#E8E3D5] font-bold">
              {demandKg.toLocaleString()}<span className="text-[#6F956B] text-3xl sm:text-4xl font-mono ml-2">KG</span>
            </div>
            <div>
              <span
                className={`inline-block px-4 py-1.5 font-mono text-xs sm:text-sm font-bold tracking-[0.2em] uppercase border border-[#1A241B] transition-all duration-300 ${levelInfo.bg}`}
                style={{ color: levelInfo.color }}
              >
                {levelInfo.label}
              </span>
            </div>
          </div>

          {/* Premium Interactive Slider Track */}
          <div className="space-y-4 pt-4">
            <div className="relative flex items-center">
              <input
                type="range"
                min="1000"
                max="10000"
                step="100"
                value={demandKg}
                onChange={handleSliderChange}
                className="w-full h-3 bg-[#080B08] rounded-full appearance-none cursor-pointer border border-[#1A241B] accent-[#6F956B] focus:outline-none shadow-inner"
              />
            </div>

            {/* Slider Scale Indicators in KG */}
            <div className="flex justify-between font-mono text-xs text-[#9A9D91] uppercase tracking-wider px-1 font-semibold">
              <span>1,000 KG</span>
              <span>2,500 KG</span>
              <span>5,000 KG</span>
              <span>7,500 KG</span>
              <span>10,000 KG</span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-6 border-t border-[#1A241B]/80 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs sm:text-sm">
            <span className="text-[#9A9D91]">
              Demand set to <strong className="text-[#C7A45A]">{demandKg.toLocaleString()} KG</strong> (Persisted across system)
            </span>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-[#102B18] hover:bg-[#315F38] border border-[#6F956B] text-[#E8E3D5] font-mono text-xs font-bold tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>SEE COMMAND CENTER RESPONSE</span>
              <span>→</span>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
