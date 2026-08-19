import React from 'react';
import { getSmartCropRotation } from '../utils/cropRotation';

export default function SmartCropRotation({ crop = 'Rice', telemetry = {} }) {
  const rotation = getSmartCropRotation(crop, telemetry);

  return (
    <section className="py-14 border-b border-[#1A241B] animate-feed-item">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#6F956B]" />
            <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.3em] uppercase font-medium">
              DECISION SUPPORT // SOIL HEALTH & ROTATION
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#E8E3D5]">
            SMART CROP ROTATION
          </h2>
          <p className="font-mono text-xs text-[#9A9D91] mt-2 max-w-2xl">
            Prevents long-term soil nutrient depletion and pest buildup by suggesting optimal crop succession cycles based on regional farming patterns.
          </p>
        </div>

        <div className="font-mono text-[10px] text-[#9A9D91] border border-[#1A241B] p-2.5 bg-[#101510]">
          <span>RECOMMENDATION TYPE: </span>
          <span className="text-[#6F956B] font-bold">DETERMINISTIC DECISION-SUPPORT</span>
        </div>
      </div>

      {/* Main Rotation Flow Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Visual Rotation Pipeline */}
        <div className="lg:col-span-5 p-8 bg-[#101510] border border-[#1A241B] flex flex-col justify-between space-y-6">
          <div>
            <span className="font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase block mb-4">
              ROTATION FLOW SEQUENCE
            </span>

            {/* Current Crop */}
            <div className="p-4 bg-[#080B08] border border-[#1A241B] space-y-1">
              <span className="font-mono text-[9px] text-[#9A9D91] uppercase tracking-widest block">
                01. CURRENT CROP
              </span>
              <div className="font-display text-2xl text-[#E8E3D5]">
                {rotation.currentCrop}
              </div>
              <span className="font-mono text-[10px] text-[#6F956B] block">
                Stage: {rotation.cropStage}
              </span>
            </div>

            {/* Down Arrow */}
            <div className="flex justify-center my-3 text-[#6F956B] font-mono text-xl font-bold">
              ↓
            </div>

            {/* Recommended Next Crop */}
            <div className="p-5 bg-[#102B18] border border-[#315F38] space-y-1 shadow-[0_0_20px_rgba(49,95,56,0.15)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#6F956B] uppercase tracking-widest font-bold">
                  02. RECOMMENDED NEXT CROP
                </span>
                <span className="font-mono text-[8px] px-2 py-0.5 bg-[#315F38] text-[#E8E3D5] font-bold uppercase">
                  RECOMMENDED
                </span>
              </div>
              <div className="font-display text-2xl sm:text-3xl text-[#E8E3D5] tracking-wide">
                {rotation.recommendedNext}
              </div>
              <span className="font-mono text-[11px] text-[#C7A45A] block font-medium">
                Category: {rotation.category}
              </span>
            </div>

            {/* Down Arrow */}
            <div className="flex justify-center my-3 text-[#9A9D91] font-mono text-xl font-bold">
              ↓
            </div>

            {/* Future Rotation */}
            <div className="p-4 bg-[#080B08] border border-[#1A241B] space-y-1">
              <span className="font-mono text-[9px] text-[#9A9D91] uppercase tracking-widest block">
                03. FUTURE ROTATION STAGE
              </span>
              <div className="font-display text-xl text-[#E8E3D5]">
                {rotation.futureRotation}
              </div>
              <span className="font-mono text-[10px] text-[#9A9D91] block">
                Long-Term Soil Balance Cycle
              </span>
            </div>
          </div>

          {/* Moisture Match Tag */}
          <div className="pt-4 border-t border-[#1A241B] font-mono text-[10px] text-[#6F956B]">
            ✓ {rotation.moistureNotice}
          </div>
        </div>

        {/* Right Column: Why This Crop & Rationale */}
        <div className="lg:col-span-7 p-8 bg-[#101510] border border-[#1A241B] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#1A241B]">
              <span className="font-mono text-[10px] text-[#C7A45A] tracking-[0.2em] uppercase font-bold">
                WHY THIS ROTATION?
              </span>
              <span className="font-mono text-[10px] text-[#9A9D91]">
                SUITABILITY: {rotation.seasonSuitability}
              </span>
            </div>

            <h3 className="font-display text-2xl text-[#E8E3D5] mb-4">
              Agronomic Rationale for {rotation.recommendedNext}
            </h3>

            <div className="space-y-3 font-mono text-xs text-[#E8E3D5]">
              {rotation.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-[#080B08] border border-[#1A241B]">
                  <span className="text-[#6F956B] font-bold text-sm shrink-0">0{idx + 1}.</span>
                  <p className="text-[#9A9D91] text-[11px] leading-relaxed">
                    {reason}
                  </p>
                </div>
              ))}
            </div>

            {/* Target Parameters */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[#1A241B] font-mono text-xs">
              <div>
                <span className="text-[10px] text-[#9A9D91] uppercase block">Ideal Moisture Range</span>
                <span className="text-[#6F956B] font-bold">{rotation.idealMoistureRange}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9A9D91] uppercase block">Rotation Goal</span>
                <span className="text-[#C7A45A] font-bold">{rotation.category}</span>
              </div>
            </div>
          </div>

          {/* Soil Nutrient Disclaimer Banner */}
          <div className="p-4 bg-[#2B2310]/60 border border-[#C7A45A]/40 font-mono text-[10px] text-[#C7A45A] leading-relaxed">
            <span className="font-bold uppercase tracking-wider block mb-0.5">⚠️ SOIL NUTRIENT NOTICE</span>
            {rotation.disclaimer}
          </div>
        </div>
      </div>
    </section>
  );
}
