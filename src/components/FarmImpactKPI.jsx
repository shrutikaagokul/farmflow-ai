import React, { useState } from 'react';
import { calculateFarmImpact, KPI_METADATA } from '../utils/farmImpact';

export default function FarmImpactKPI({ pipeline, submittedInput = {}, compact = true }) {
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

  // The 4 High-Value Executive Metrics for compact mode
  const EXECUTIVE_METRICS = [
    { key: 'waterSavedL', label: 'WATER SAVED', sourceTag: 'FarmSense' },
    { key: 'produceRescuedKg', label: 'PRODUCE RESCUED', sourceTag: 'MarketMind' },
    { key: 'economicValueRecovered', label: 'VALUE RECOVERED', sourceTag: 'MarketMind' },
    { key: 'estimatedTimeSavedHrs', label: 'TIME SAVED', sourceTag: 'Automation' },
  ];

  const displayedList = compact ? EXECUTIVE_METRICS : KPI_METADATA;

  return (
    <section className="py-8 border-b border-[#1A241B]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.25em] uppercase font-semibold block">
            BUSINESS IMPACT
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-[#E8E3D5] mt-0.5">
            FARM IMPACT
          </h2>
        </div>

        <button
          onClick={() => setSelectedKpiForModal('ALL')}
          className="px-3 py-1.5 bg-[#101510] border border-[#1A241B] hover:border-[#6F956B] text-[#9A9D91] hover:text-[#E8E3D5] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>ⓘ</span>
          <span>Details</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {displayedList.map((item) => {
          const meta = KPI_METADATA.find((k) => k.key === item.key) || item;
          const val = impact[item.key];
          const formatted = formatValue(item.key, val);
          const sourceTag = item.sourceTag || meta.source?.split(' ')[0] || 'Pipeline';

          return (
            <div
              key={item.key}
              className="p-5 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[130px] hover:border-[#315F38] transition-colors group cursor-pointer"
              onClick={() => setSelectedKpiForModal(item.key)}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs sm:text-sm text-[#9A9D91] tracking-widest uppercase font-semibold">
                  {meta.label || item.label}
                </span>
                <span className="font-mono text-xs text-[#6F956B] px-2 py-0.5 bg-[#102B18] border border-[#1A241B] rounded-none font-semibold">
                  {sourceTag}
                </span>
              </div>

              <div className="font-display text-3xl sm:text-4xl text-[#E8E3D5] tracking-tight my-2">
                {formatted}
              </div>

              {!compact && meta.explanation && (
                <p className="font-mono text-[11px] text-[#9A9D91] leading-relaxed mt-1">
                  {meta.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Transparent Formula Modal */}
      {selectedKpiForModal && (
        <div className="fixed inset-0 z-50 bg-[#080B08]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101510] border border-[#315F38] max-w-xl w-full p-6 space-y-5 text-[#E8E3D5] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A241B]">
              <h3 className="font-display text-xl text-[#E8E3D5]">
                Impact Calculation Details
              </h3>
              <button
                onClick={() => setSelectedKpiForModal(null)}
                className="font-mono text-xs px-2.5 py-1 bg-[#1A241B] text-[#9A9D91] hover:text-[#E8E3D5] border border-[#1A241B] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {(selectedKpiForModal === 'ALL'
                ? KPI_METADATA
                : KPI_METADATA.filter((k) => k.key === selectedKpiForModal)
              ).map((meta) => (
                <div key={meta.key} className="p-3.5 bg-[#080B08] border border-[#1A241B] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E8E3D5] text-sm">{meta.label} ({meta.unit})</span>
                    <span className="text-[10px] text-[#6F956B]">{meta.source}</span>
                  </div>
                  <div className="text-[11px] text-[#C7A45A] font-semibold bg-[#2B2310]/50 p-2 border border-[#2B2310]">
                    Formula: {meta.formula}
                  </div>
                  <p className="text-[11px] text-[#9A9D91] leading-relaxed">
                    {meta.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#1A241B] flex justify-end">
              <button
                onClick={() => setSelectedKpiForModal(null)}
                className="px-4 py-1.5 bg-[#315F38] text-[#E8E3D5] font-mono text-xs uppercase tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
