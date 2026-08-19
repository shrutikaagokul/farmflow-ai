import React, { useState } from 'react';
import { calculateFarmImpact, KPI_METADATA } from '../utils/farmImpact';

export default function FarmImpactKPI({ pipeline, submittedInput = {} }) {
  const [selectedKpiForModal, setSelectedKpiForModal] = useState(null);
  const impact = calculateFarmImpact(pipeline, submittedInput);

  const formatValue = (key, rawValue) => {
    if (key === 'economicValueRecovered' || key === 'economicValueAtRisk' || key === 'estimatedFarmerBenefit') {
      return `₹${Math.round(rawValue).toLocaleString('en-IN')}`;
    }
    if (key === 'demandFulfillmentPct') {
      return `${rawValue}%`;
    }
    if (key === 'estimatedTimeSavedHrs') {
      return `${rawValue} hrs`;
    }
    return `${Math.round(rawValue).toLocaleString()} ${KPI_METADATA.find(k => k.key === key)?.unit || ''}`;
  };

  return (
    <section className="py-14 border-b border-[#1A241B] animate-feed-item">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#C7A45A]" />
            <span className="font-mono text-[10px] text-[#C7A45A] tracking-[0.3em] uppercase font-medium">
              MEASURABLE BUSINESS IMPACT // AUDIT
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#E8E3D5]">
            FARM IMPACT & VALUE GENERATION
          </h2>
          <p className="font-mono text-xs text-[#9A9D91] mt-2 max-w-2xl">
            Calculated metrics derived directly from the 4-agent decision pipeline. Measure what FarmFlow saves, recovers, and protects.
          </p>
        </div>

        <button
          onClick={() => setSelectedKpiForModal('ALL')}
          className="px-4 py-2 bg-[#101510] border border-[#1A241B] hover:border-[#6F956B] text-[#E8E3D5] font-mono text-[10px] tracking-[0.2em] uppercase flex items-center gap-2 transition-all cursor-pointer"
        >
          <span className="text-[#6F956B]">ⓘ</span>
          <span>HOW IS THIS CALCULATED?</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {KPI_METADATA.map((meta) => {
          const val = impact[meta.key];
          const formatted = formatValue(meta.key, val);

          return (
            <div
              key={meta.key}
              className="p-6 bg-[#101510] border border-[#1A241B] hover:border-[#315F38] transition-all flex flex-col justify-between min-h-[220px] relative group"
            >
              <div>
                {/* Header Badge Strip */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1A241B]/60">
                  <span className="font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase font-bold">
                    {meta.label}
                  </span>
                  <span
                    className="font-mono text-[8px] px-2 py-0.5 tracking-wider uppercase border border-[#1A241B] rounded-none"
                    style={{ color: meta.badgeColor, backgroundColor: `${meta.badgeColor}15` }}
                  >
                    {meta.source}
                  </span>
                </div>

                {/* Main Large Value */}
                <div className="my-2">
                  <div className="font-display text-4xl sm:text-5xl text-[#E8E3D5] tracking-tight">
                    {formatted}
                  </div>
                  {meta.isEstimated && (
                    <span className="font-mono text-[9px] text-[#9A9D91]/70 uppercase tracking-widest block mt-1">
                      [CALCULATED ESTIMATE]
                    </span>
                  )}
                </div>

                {/* Explanation */}
                <p className="font-mono text-[11px] text-[#9A9D91] leading-relaxed mt-2">
                  {meta.explanation}
                </p>
              </div>

              {/* Card Footer Interaction */}
              <div className="pt-3 mt-4 border-t border-[#1A241B]/50 flex items-center justify-between">
                <span className="font-mono text-[9px] text-[#9A9D91]/60 tracking-wider">
                  PIPELINE DERIVED
                </span>
                <button
                  onClick={() => setSelectedKpiForModal(meta.key)}
                  className="font-mono text-[9px] text-[#6F956B] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Formula</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: How is this calculated? */}
      {selectedKpiForModal && (
        <div className="fixed inset-0 z-50 bg-[#080B08]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101510] border border-[#315F38] max-w-2xl w-full p-6 sm:p-8 space-y-6 text-[#E8E3D5] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#1A241B]">
              <div>
                <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase font-bold block">
                  TRANSPARENT FORMULA SPECIFICATION
                </span>
                <h3 className="font-display text-2xl text-[#E8E3D5] mt-1">
                  KPI Calculation & Derivation Logic
                </h3>
              </div>
              <button
                onClick={() => setSelectedKpiForModal(null)}
                className="font-mono text-xs px-3 py-1 bg-[#1A241B] text-[#9A9D91] hover:text-[#E8E3D5] border border-[#1A241B] cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {(selectedKpiForModal === 'ALL'
                ? KPI_METADATA
                : KPI_METADATA.filter((k) => k.key === selectedKpiForModal)
              ).map((meta) => (
                <div key={meta.key} className="p-4 bg-[#080B08] border border-[#1A241B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E8E3D5]">{meta.label} ({meta.unit})</span>
                    <span className="text-[10px] text-[#6F956B]">{meta.source}</span>
                  </div>
                  <div className="text-[11px] text-[#C7A45A] font-semibold bg-[#2B2310]/50 p-2 border border-[#2B2310]">
                    Formula: {meta.formula}
                  </div>
                  <p className="text-[10px] text-[#9A9D91] leading-relaxed">
                    {meta.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#1A241B] font-mono text-[10px] text-[#9A9D91] flex items-center justify-between">
              <span>* ALL VALUES ARE PROJECTED FROM PIPELINE SIMULATION TELEMETRY</span>
              <button
                onClick={() => setSelectedKpiForModal(null)}
                className="px-4 py-2 bg-[#315F38] text-[#E8E3D5] font-semibold uppercase tracking-wider cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
