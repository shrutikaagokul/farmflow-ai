import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import FieldBackground from '../components/FieldBackground';
import { useAuth } from '../context/AuthContext';

const MetricCard = ({ label, value, unit, accent, sub }) => (
  <div className="p-5 bg-[#101510] border border-[#1A241B] flex flex-col justify-between min-h-[130px]">
    <span className="font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase block mb-2">{label}</span>
    <div>
      <span className={`font-display text-3xl sm:text-4xl tracking-tight ${accent || 'text-[#E8E3D5]'}`}>
        {value}
      </span>
      {unit && <span className="font-mono text-xs text-[#9A9D91] ml-1">{unit}</span>}
    </div>
    {sub && <span className="font-mono text-[10px] text-[#9A9D91] mt-2 block">{sub}</span>}
  </div>
);

// Sample regional harvest lots with timeline and load availability
const REGIONAL_HARVEST_LOTS = [
  {
    id: 'LOT-TN-8821',
    crop: 'Paddy / Rice (Ponni Samba)',
    origin: 'Thanjavur, Cauvery Delta',
    totalLoadKg: 5200,
    availableSurplusKg: 700,
    harvestTimeline: '25–35 days (Tillering Stage)',
    pricePerKg: 45,
    dispatchDate: '2026-09-15',
    status: 'Growing (Monitored)',
    health: '92% Optimal',
  },
  {
    id: 'LOT-TN-4102',
    crop: 'Tomato (Hybrid Desi)',
    origin: 'Dharmapuri, Tamil Nadu',
    totalLoadKg: 3400,
    availableSurplusKg: 1200,
    harvestTimeline: '5–7 days (Fruiting Stage)',
    pricePerKg: 40,
    dispatchDate: '2026-08-26',
    status: 'Ready for Harvest',
    health: '88% Optimal',
  },
  {
    id: 'LOT-TN-3091',
    crop: 'Onion (Red Globe)',
    origin: 'Perambalur, Tamil Nadu',
    totalLoadKg: 4500,
    availableSurplusKg: 950,
    harvestTimeline: '12–15 days (Ripening)',
    pricePerKg: 35,
    dispatchDate: '2026-09-02',
    status: 'Maturing',
    health: '95% Optimal',
  },
  {
    id: 'LOT-TN-9912',
    crop: 'Chili (Guntur Sannam)',
    origin: 'Ramanathapuram, Tamil Nadu',
    totalLoadKg: 1800,
    availableSurplusKg: 400,
    harvestTimeline: 'Ready now (Harvest Stage)',
    pricePerKg: 85,
    dispatchDate: '2026-08-21',
    status: 'Immediate Dispatch',
    health: '90% Optimal',
  },
];

export default function BuyerDashboard() {
  const { user, isDemo } = useAuth();
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load calculator state
  const [selectedLotId, setSelectedLotId] = useState('LOT-TN-8821');
  const [requestedKg, setRequestedKg] = useState(1000);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch pipeline data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const payload = {
          temperature: 32,
          humidity: 74,
          soil_moisture: 42,
          rain_probability: 25,
          wind_speed: 12,
          crop: 'Rice',
          crop_stage: 'Vegetative',
          market_demand: 4500,
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
          setPipeline(data.pipeline);
        }
      } catch (e) {
        console.warn('Buyer dashboard fetch:', e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const mm = pipeline?.marketmind || {};
  const cg = pipeline?.cropguard || {};

  // Metrics calculation
  const demand = mm.market_demand_kg || 4500;
  const supply = cg.expected_yield_kg || 5200;
  const harvestWindow = cg.harvest_window || '25–35 days';
  const surplus = mm.surplus_kg || 700;
  const rescued = mm.food_rescued_kg || 290;
  const unallocated = mm.remaining_unallocated_kg || 0;
  const valueRecovered = mm.economic_value_recovered_inr || 0;
  const valueAtRisk = mm.economic_value_at_risk_inr || 0;
  const wasteRisk = mm.waste_risk_level || 'NONE';
  const reason = mm.decision_reason || '';
  const allocations = mm.allocations || [];
  const fulfillment = demand > 0 ? Math.min(100, Math.round((Math.min(supply, demand) / demand) * 100)) : 0;

  // Selected lot for calculator
  const selectedLot = REGIONAL_HARVEST_LOTS.find((l) => l.id === selectedLotId) || REGIONAL_HARVEST_LOTS[0];
  const totalCostEstimate = requestedKg * selectedLot.pricePerKg;
  const canFulfill = requestedKg <= selectedLot.availableSurplusKg || requestedKg <= selectedLot.totalLoadKg;

  const handleBookOrder = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#080B08] text-[#E8E3D5] relative selection:bg-[#315F38]/40">
      <FieldBackground />
      <Navigation />

      <main className="relative z-10 pt-20 md:pt-24 pb-24 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">

        {/* Header */}
        <header className="py-8 border-b border-[#1A241B] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 bg-[#C7A45A]" />
              <span className="font-mono text-[10px] text-[#9A9D91] tracking-[0.25em] uppercase">
                Buyer Procurement Portal{user?.name ? ` // ${user.name}` : ''}
              </span>
              {isDemo && (
                <span className="px-2 py-0.5 bg-[#C7A45A]/20 text-[#C7A45A] font-mono text-[8px] tracking-wider uppercase rounded-sm">
                  Demo Mode
                </span>
              )}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl text-[#E8E3D5] tracking-tight leading-none">
              HARVEST LOAD <br className="sm:hidden" />
              <span className="italic font-serif text-[#C7A45A]">&amp; AVAILABILITY</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="px-4 py-2 bg-[#101510] border border-[#1A241B] flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-[#C7A45A] animate-pulse' : 'bg-[#6F956B]'}`} />
              <span className="text-[10px] text-[#9A9D91] tracking-wider uppercase">
                {loading ? 'Loading Pipeline…' : pipeline ? 'Live Agent Intelligence' : 'Demo Telemetry'}
              </span>
            </div>
          </div>
        </header>

        {/* ============================================================ */}
        {/* SECTION 1: Load Availability & Timeline Summary */}
        {/* ============================================================ */}
        <section className="py-12 border-b border-[#1A241B]">
          <div className="mb-6">
            <span className="font-mono text-[10px] text-[#C7A45A] tracking-[0.25em] uppercase block mb-1">
              01 // Load Availability & Timeline
            </span>
            <h2 className="font-display text-3xl text-[#E8E3D5]">Harvest Load Summary</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Projected Load"
              value={supply.toLocaleString()}
              unit="KG"
              accent="text-[#6F956B]"
              sub="10-Acre Thanjavur Harvest"
            />
            <MetricCard
              label="Harvest Availability"
              value={harvestWindow}
              accent="text-[#C7A45A]"
              sub="CropGuard Readiness Estimate"
            />
            <MetricCard
              label="Commercial Demand Load"
              value={demand.toLocaleString()}
              unit="KG"
              accent="text-[#E8E3D5]"
              sub={`Fulfillment: ${fulfillment}%`}
            />
            <MetricCard
              label="Uncommitted Surplus Load"
              value={surplus.toLocaleString()}
              unit="KG"
              accent={surplus > 0 ? 'text-[#6F956B]' : 'text-[#9A9D91]'}
              sub={surplus > 0 ? 'Ready for buyer procurement' : 'Fully allocated'}
            />
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: Harvest Load & Availability Schedule (Table) */}
        {/* ============================================================ */}
        <section className="py-12 border-b border-[#1A241B]">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-1">
                02 // Availability Schedule
              </span>
              <h2 className="font-display text-3xl text-[#E8E3D5]">Regional Harvest Lots</h2>
            </div>
            <span className="font-mono text-[10px] text-[#9A9D91] tracking-wider uppercase">
              Updated Live from Farm Sense &amp; CropGuard
            </span>
          </div>

          <div className="overflow-x-auto border border-[#1A241B]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#101510] border-b border-[#1A241B]">
                  {['Lot ID', 'Crop & Variety', 'Origin', 'Total Load', 'Surplus Avail.', 'Harvest Timeline', 'Est. Price', 'Status', 'Action'].map((h) => (
                    <th key={h} className="py-3.5 px-4 font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REGIONAL_HARVEST_LOTS.map((lot) => (
                  <tr key={lot.id} className="border-b border-[#1A241B]/50 hover:bg-[#101510] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-[#C7A45A] font-medium">{lot.id}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#E8E3D5]">{lot.crop}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#9A9D91]">{lot.origin}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#E8E3D5]">{lot.totalLoadKg.toLocaleString()} KG</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#6F956B] font-semibold">{lot.availableSurplusKg.toLocaleString()} KG</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#C7A45A]">{lot.harvestTimeline}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#E8E3D5]">₹{lot.pricePerKg}/kg</td>
                    <td className="py-3.5 px-4">
                      <span className={`font-mono text-[8px] tracking-wider uppercase px-2 py-1 ${
                        lot.status.includes('Ready') || lot.status.includes('Immediate')
                          ? 'bg-[#6F956B]/20 text-[#6F956B]'
                          : 'bg-[#C7A45A]/20 text-[#C7A45A]'
                      }`}>
                        {lot.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedLotId(lot.id)}
                        className={`font-mono text-[9px] tracking-wider uppercase px-3 py-1.5 border transition-all ${
                          selectedLotId === lot.id
                            ? 'bg-[#102B18] border-[#6F956B] text-[#E8E3D5]'
                            : 'bg-[#101510] border-[#1A241B] text-[#9A9D91] hover:text-[#E8E3D5] hover:border-[#315F38]'
                        }`}
                      >
                        {selectedLotId === lot.id ? 'Selected' : 'Select Lot'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: Buyer Load Order & Reservation Calculator */}
        {/* ============================================================ */}
        <section className="py-12 border-b border-[#1A241B]">
          <div className="mb-6">
            <span className="font-mono text-[10px] text-[#C7A45A] tracking-[0.25em] uppercase block mb-1">
              03 // Load Booking &amp; Procurement Calculator
            </span>
            <h2 className="font-display text-3xl text-[#E8E3D5]">Reserve Harvest Load</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input & Calculator Form */}
            <div className="lg:col-span-7 p-6 bg-[#101510] border border-[#1A241B] space-y-6">
              <div>
                <label className="block font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase mb-2">
                  Select Harvest Lot
                </label>
                <select
                  value={selectedLotId}
                  onChange={(e) => setSelectedLotId(e.target.value)}
                  className="w-full bg-[#080B08] border border-[#1A241B] px-4 py-3 text-[#E8E3D5] font-mono text-xs focus:border-[#315F38] focus:outline-none transition-colors"
                >
                  {REGIONAL_HARVEST_LOTS.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.id} — {lot.crop} ({lot.availableSurplusKg} KG Avail @ ₹{lot.pricePerKg}/kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase">
                    Required Load Quantity (KG)
                  </label>
                  <span className="font-mono text-xs text-[#C7A45A]">{requestedKg.toLocaleString()} KG ({ (requestedKg / 1000).toFixed(2) } Metric Tons)</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={requestedKg}
                  onChange={(e) => setRequestedKg(Number(e.target.value))}
                  className="w-full accent-[#315F38]"
                />
                <div className="flex justify-between font-mono text-[9px] text-[#9A9D91] mt-1">
                  <span>100 KG</span>
                  <span>2,500 KG</span>
                  <span>5,000 KG</span>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 bg-[#080B08] border border-[#1A241B] space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-[#1A241B]">
                  <span className="text-[#9A9D91]">Selected Lot:</span>
                  <span className="text-[#E8E3D5]">{selectedLot.crop}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A241B]">
                  <span className="text-[#9A9D91]">Estimated Delivery Window:</span>
                  <span className="text-[#C7A45A]">{selectedLot.harvestTimeline}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A241B]">
                  <span className="text-[#9A9D91]">Unit Price:</span>
                  <span className="text-[#E8E3D5]">₹{selectedLot.pricePerKg} / KG</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1A241B]">
                  <span className="text-[#9A9D91]">Fulfillment Feasibility:</span>
                  <span className={canFulfill ? 'text-[#6F956B]' : 'text-[#8F3E3E]'}>
                    {canFulfill ? '100% Available' : 'Exceeds Current Lot'}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm font-semibold">
                  <span className="text-[#E8E3D5]">Total Estimated Cost:</span>
                  <span className="text-[#C7A45A]">₹{totalCostEstimate.toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handleBookOrder}>
                <button
                  type="submit"
                  disabled={!canFulfill}
                  className="w-full px-6 py-3.5 bg-[#102B18] border border-[#315F38] text-[#E8E3D5] font-mono text-xs tracking-[0.2em] uppercase hover:bg-[#315F38] transition-all disabled:opacity-40"
                >
                  Confirm Load Reservation →
                </button>
              </form>

              {bookingSuccess && (
                <div className="p-3 bg-[#102B18] border border-[#6F956B] text-[#6F956B] font-mono text-xs tracking-wider text-center">
                  ✓ Load reservation request logged successfully! FPO notified for dispatch scheduling.
                </div>
              )}
            </div>

            {/* MarketMind Zero-Waste Allocation Visualizer */}
            <div className="lg:col-span-5 p-6 bg-[#101510] border border-[#1A241B] flex flex-col justify-between">
              <div>
                <span className="font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase block mb-2">
                  MarketMind Allocation Engine
                </span>
                <h3 className="font-display text-2xl text-[#E8E3D5] mb-4">Current Harvest Routing</h3>

                <div className="space-y-3 font-mono text-xs">
                  {allocations.length > 0 ? (
                    allocations.map((a, idx) => (
                      <div key={idx} className="p-3 bg-[#080B08] border border-[#1A241B] flex justify-between items-center">
                        <span className="text-[#E8E3D5]">{a.destination}</span>
                        <span className="text-[#6F956B] font-semibold">{a.quantity_kg?.toLocaleString()} KG</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-3 bg-[#080B08] border border-[#1A241B] flex justify-between items-center">
                        <span className="text-[#E8E3D5]">Market A (Commercial)</span>
                        <span className="text-[#6F956B]">4,500 KG</span>
                      </div>
                      <div className="p-3 bg-[#080B08] border border-[#1A241B] flex justify-between items-center">
                        <span className="text-[#E8E3D5]">Food Rescue / NGO</span>
                        <span className="text-[#C7A45A]">290 KG</span>
                      </div>
                      <div className="p-3 bg-[#080B08] border border-[#1A241B] flex justify-between items-center">
                        <span className="text-[#E8E3D5]">Unallocated Surplus</span>
                        <span className="text-[#8F3E3E]">410 KG</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1A241B]">
                <span className="font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase block mb-1">
                  Decision Reasoning
                </span>
                <p className="text-xs text-[#9A9D91] font-sans leading-relaxed">
                  {reason || 'Harvest matches commercial demand and excess is routed through rescue channels.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4: Waste Risk & Opportunity */}
        {/* ============================================================ */}
        <section className="py-12">
          <div className="mb-6">
            <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase block mb-1">
              04 // Risk Assessment
            </span>
            <h2 className="font-display text-3xl text-[#E8E3D5]">Waste Risk &amp; Economic Value</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              label="Unallocated Load"
              value={unallocated.toLocaleString()}
              unit="KG"
              accent={unallocated > 0 ? 'text-[#8F3E3E]' : 'text-[#6F956B]'}
              sub={unallocated === 0 ? 'Zero waste achieved' : 'Needs additional rescue capacity'}
            />
            <MetricCard
              label="Food Rescued Load"
              value={rescued.toLocaleString()}
              unit="KG"
              accent="text-[#6F956B]"
              sub="Diverted from landfill"
            />
            <MetricCard
              label="Economic Value Saved"
              value={`₹${valueRecovered.toLocaleString()}`}
              accent="text-[#C7A45A]"
              sub="Preserved revenue"
            />
            <MetricCard
              label="Value at Risk"
              value={`₹${valueAtRisk.toLocaleString()}`}
              accent={valueAtRisk > 0 ? 'text-[#8F3E3E]' : 'text-[#6F956B]'}
              sub={`Waste risk level: ${wasteRisk}`}
            />
          </div>
        </section>

      </main>
    </div>
  );
}
