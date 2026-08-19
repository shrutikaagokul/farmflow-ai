import React, { useState } from 'react';
import { getSmartCropRotation } from '../utils/cropRotation';

export default function SmartCropRotation({ crop = 'Rice', telemetry = {} }) {
  const [showFullRationale, setShowFullRationale] = useState(false);
  const rotation = getSmartCropRotation(crop, telemetry);

  return (
    <section className="py-8 border-b border-[#1A241B]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.25em] uppercase font-semibold block">
            SOIL HEALTH & CROP SUCCESSION
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-[#E8E3D5] mt-0.5">
            CROP ROTATION
          </h2>
        </div>

        <button
          onClick={() => setShowFullRationale(!showFullRationale)}
          className="px-3 py-1.5 bg-[#101510] border border-[#1A241B] hover:border-[#6F956B] text-[#9A9D91] hover:text-[#E8E3D5] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          {showFullRationale ? 'Hide Rationale' : 'View Rationale'}
        </button>
      </div>

      {/* Main Visual Sequence & Quick Bullet Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#101510] border border-[#1A241B] p-6">
        {/* Compact Flow */}
        <div className="md:col-span-6 flex items-center justify-between gap-3">
          {/* Current */}
          <div className="p-3 bg-[#080B08] border border-[#1A241B] text-center flex-1">
            <span className="font-mono text-xs text-[#9A9D91] uppercase tracking-widest block font-semibold">CURRENT</span>
            <span className="font-display text-xl text-[#E8E3D5] font-semibold">{rotation.currentCrop}</span>
          </div>

          <span className="text-[#6F956B] font-mono text-lg font-bold">→</span>

          {/* Recommended */}
          <div className="p-3 bg-[#102B18] border border-[#315F38] text-center flex-1">
            <span className="font-mono text-xs text-[#6F956B] uppercase tracking-widest block font-bold">RECOMMENDED</span>
            <span className="font-display text-xl text-[#E8E3D5] font-bold">{rotation.recommendedNext}</span>
          </div>

          <span className="text-[#9A9D91] font-mono text-lg font-bold">→</span>

          {/* Next */}
          <div className="p-3 bg-[#080B08] border border-[#1A241B] text-center flex-1">
            <span className="font-mono text-xs text-[#9A9D91] uppercase tracking-widest block font-semibold">NEXT</span>
            <span className="font-display text-xl text-[#E8E3D5]">{rotation.futureRotation}</span>
          </div>
        </div>

        {/* Quick 2-3 Bullet Rationale */}
        <div className="md:col-span-6 space-y-1.5 font-mono text-xs text-[#9A9D91] md:border-l md:border-[#1A241B] md:pl-6">
          <span className="font-mono text-xs text-[#C7A45A] font-semibold uppercase tracking-wider block mb-1">
            WHY THIS ROTATION
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[#6F956B] font-bold">•</span>
            <span>Restores soil nitrogen & organic matter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6F956B] font-bold">•</span>
            <span>Breaks monoculture pest & weed cycles</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#6F956B] font-bold">•</span>
            <span>Uses residual paddy moisture ({rotation.idealMoistureRange})</span>
          </div>
        </div>
      </div>

      {/* Expandable Rationale Details */}
      {showFullRationale && (
        <div className="mt-4 p-5 bg-[#080B08] border border-[#1A241B] space-y-3 animate-feed-item font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-[#6F956B] font-bold pb-2 border-b border-[#1A241B]">
            <span>AGRONOMIC DETAILS ({rotation.seasonSuitability})</span>
            <span>{rotation.moistureNotice}</span>
          </div>
          <ul className="space-y-2 text-[#9A9D91] text-[11px] leading-relaxed">
            {rotation.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#6F956B] font-bold">0{i + 1}.</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 text-[10px] text-[#C7A45A]/90 border-t border-[#1A241B]">
            ⚠️ {rotation.disclaimer}
          </div>
        </div>
      )}
    </section>
  );
}
