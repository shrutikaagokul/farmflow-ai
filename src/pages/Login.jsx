import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FieldBackground from '../components/FieldBackground';
import { useAuth } from '../context/AuthContext';

const STEPS = { ROLE: 'role', MOBILE: 'mobile', OTP: 'otp' };

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(STEPS.ROLE);
  const [role, setRole] = useState('fpo');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------------------------
  // Demo Login Handler
  // -----------------------------------------------------------------------
  const handleDemoLogin = async (demoRole) => {
    setLoading(true);
    setError('');
    try {
      let res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: demoRole }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('http://localhost:8000/api/auth/demo-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: demoRole }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        localStorage.setItem('farmflow_demo_role', demoRole);
        login(data.token, data.user);
        // Direct route after successful login
        if (demoRole === 'buyer') {
          navigate('/dashboard/buyer');
        } else {
          navigate('/home');
        }
      } else {
        setError('Demo login failed. Ensure backend server is running on port 8000.');
      }
    } catch {
      setError('Connection error. Run: python server.py');
    }
    setLoading(false);
  };

  // -----------------------------------------------------------------------
  // Request OTP
  // -----------------------------------------------------------------------
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (mobile.length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      console.log('[FARMFLOW AUTH] Requesting OTP via /api/auth/request-otp for role:', role);
      let res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, role }),
      }).catch((err) => {
        console.warn('[FARMFLOW AUTH] Relative fetch failed, attempting http://localhost:8000', err);
        return null;
      });

      if (!res || !res.ok) {
        console.warn('[FARMFLOW AUTH] Relative fetch returned status:', res?.status, '— Retrying direct target http://localhost:8000');
        res = await fetch('http://localhost:8000/api/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, role }),
        }).catch((err) => {
          console.error('[FARMFLOW AUTH] Direct target fetch failed:', err);
          return null;
        });
      }

      console.log('[FARMFLOW AUTH] Final request OTP HTTP status:', res?.status);

      if (res && res.ok) {
        setStep(STEPS.OTP);
        setOtp('');
      } else {
        const detail = res ? (await res.json().catch(() => ({}))).detail : null;
        setError(detail || 'Failed to send OTP. Ensure backend is running.');
      }
    } catch (err) {
      console.error('[FARMFLOW AUTH] Unexpected error during OTP request:', err);
      setError('Connection error.');
    }
    setLoading(false);
  };

  // -----------------------------------------------------------------------
  // Verify OTP
  // -----------------------------------------------------------------------
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (otp.length < 4) {
      setError('Enter the valid OTP code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      console.log('[FARMFLOW AUTH] Verifying OTP via /api/auth/verify-otp');
      let res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, role }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('http://localhost:8000/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, otp, role }),
        }).catch(() => null);
      }

      console.log('[FARMFLOW AUTH] Final verify OTP HTTP status:', res?.status);

      if (res && res.ok) {
        const data = await res.json();
        localStorage.setItem('farmflow_demo_role', role);
        login(data.token, data.user);
        if (role === 'buyer') {
          navigate('/dashboard/buyer');
        } else {
          navigate('/home');
        }
      } else {
        const detail = res ? (await res.json().catch(() => ({}))).detail : null;
        setError(detail || 'Invalid OTP');
      }
    } catch {
      setError('Connection error.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080B08] text-[#E8E3D5] relative flex flex-col justify-between selection:bg-[#315F38]/40 overflow-x-hidden">
      <FieldBackground />
      <Navigation />

      {/* Atmospheric Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[radial-gradient(circle,#102B18_0%,transparent_70%)] opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-[radial-gradient(circle,#C7A45A_0%,transparent_80%)] opacity-10 blur-3xl pointer-events-none" />

      {/* Main Login Viewport Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 pt-28 pb-16">
        
        {/* Large Prominent Login Panel */}
        <div className="w-full max-w-[820px] bg-[#101510]/95 backdrop-blur-xl border border-[#1A241B] border-t-2 border-t-[#6F956B] p-8 sm:p-12 md:p-14 shadow-[0_0_60px_rgba(0,0,0,0.85)] relative">
          
          {/* Top Panel Branding Header */}
          <div className="text-center pb-8 mb-8 border-b border-[#1A241B]">
            <div className="inline-flex items-center gap-3 px-3.5 py-1 bg-[#080B08] border border-[#1A241B] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#6F956B] animate-pulse" />
              <span className="font-mono text-xs sm:text-sm text-[#9A9D91] tracking-[0.25em] uppercase font-semibold">
                SYSTEM ACCESS • AUTONOMOUS INTELLIGENCE
              </span>
            </div>

            {/* Logo Image */}
            <div className="flex justify-center mb-4">
              <img src="/farmflow-logo.png" alt="FarmFlow AI Logo" className="w-14 h-14 object-contain filter drop-shadow-[0_0_12px_rgba(111,149,107,0.4)]" />
            </div>

            <h1 className="font-display text-4xl sm:text-6xl text-[#E8E3D5] tracking-tight leading-tight">
              FARMFLOW <span className="text-[#6F956B] italic font-serif font-light">AI</span>
            </h1>

            <p className="font-mono text-xs sm:text-sm text-[#9A9D91] tracking-[0.25em] uppercase font-semibold mt-2">
              Field. Flow. Impact.
            </p>

            <p className="text-xs sm:text-sm text-[#9A9D91] font-mono tracking-wider uppercase mt-3">
              Precision Agricultural & Demand Orchestration Command Center
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-8">
            <span className="block font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.25em] uppercase mb-3 text-center font-semibold">
              01 // SELECT SYSTEM ROLE
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setRole('fpo'); setError(''); }}
                className={`p-5 border transition-all text-left flex items-start gap-4 cursor-pointer ${
                  role === 'fpo'
                    ? 'bg-[#102B18]/60 border-[#6F956B] shadow-[0_0_20px_rgba(111,149,107,0.15)]'
                    : 'bg-[#080B08] border-[#1A241B] hover:border-[#315F38] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="w-10 h-10 rounded-sm bg-[#102B18] border border-[#315F38] flex items-center justify-center text-xl shrink-0">
                  🌾
                </div>
                <div>
                  <span className="font-mono text-xs sm:text-sm text-[#E8E3D5] tracking-wider uppercase block font-bold">
                    FPO / Farm Organization
                  </span>
                  <span className="text-xs text-[#9A9D91] font-sans leading-relaxed block mt-1">
                    Manage soil telemetry, crop health, yield ML & field action plans.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setRole('buyer'); setError(''); }}
                className={`p-5 border transition-all text-left flex items-start gap-4 cursor-pointer ${
                  role === 'buyer'
                    ? 'bg-[#2B2310]/60 border-[#C7A45A] shadow-[0_0_20px_rgba(199,164,90,0.15)]'
                    : 'bg-[#080B08] border-[#1A241B] hover:border-[#C7A45A]/50 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="w-10 h-10 rounded-sm bg-[#2B2310] border border-[#C7A45A]/40 flex items-center justify-center text-xl shrink-0">
                  🏪
                </div>
                <div>
                  <span className="font-mono text-xs sm:text-sm text-[#E8E3D5] tracking-wider uppercase block font-bold">
                    Buyer / Procurement
                  </span>
                  <span className="text-xs text-[#9A9D91] font-sans leading-relaxed block mt-1">
                    Set market demand (KG), manage produce quotas & surplus routing.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Form Step 1: Mobile Input */}
          {step === STEPS.ROLE || step === STEPS.MOBILE ? (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label className="block font-mono text-xs sm:text-sm text-[#9A9D91] tracking-[0.2em] uppercase mb-2 font-semibold">
                  02 // ENTER REGISTERED MOBILE NUMBER
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[#6F956B]">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full bg-[#080B08] border border-[#1A241B] pl-14 pr-4 py-3.5 text-[#E8E3D5] font-mono text-base tracking-widest placeholder:text-[#9A9D91]/40 focus:border-[#6F956B] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#8F3E3E]/10 border border-[#8F3E3E]/50 text-[#E8E3D5] font-mono text-xs tracking-wider">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || mobile.length < 10}
                className="w-full py-4 bg-[#102B18] border border-[#315F38] text-[#E8E3D5] font-mono text-xs sm:text-sm tracking-[0.2em] uppercase hover:bg-[#315F38] hover:border-[#6F956B] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(49,95,56,0.25)] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{loading ? 'SENDING OTP…' : 'AUTHENTICATE & SEND OTP'}</span>
                <span className="text-[#6F956B] group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>
          ) : null}

          {/* Form Step 2: OTP Verification */}
          {step === STEPS.OTP && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs sm:text-sm text-[#6F956B] tracking-[0.2em] uppercase font-semibold">
                  02 // ENTER OTP CODE
                </span>
                <button
                  type="button"
                  onClick={() => { setStep(STEPS.MOBILE); setError(''); setOtp(''); }}
                  className="font-mono text-xs text-[#9A9D91] hover:text-[#E8E3D5] tracking-wider uppercase transition-colors"
                >
                  ← CHANGE NUMBER ({mobile})
                </button>
              </div>

              {/* Clean OTP Sent Notification Banner */}
              <div className="p-4 bg-[#101510] border border-[#315F38] font-mono space-y-1 text-center my-2">
                <div className="flex items-center justify-center gap-2 text-[#6F956B] text-xs font-bold tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#6F956B] animate-pulse" />
                  <span>OTP SENT</span>
                </div>
                <p className="text-xs text-[#9A9D91] font-sans">
                  Check the backend terminal for the demo OTP.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-[#080B08] border border-[#315F38] px-4 py-4 text-[#E8E3D5] font-mono text-2xl tracking-[0.6em] text-center placeholder:text-[#9A9D91]/20 focus:border-[#6F956B] focus:outline-none transition-colors"
                  autoFocus
                />
                <span className="block font-mono text-xs text-[#9A9D91] tracking-wider uppercase text-center mt-2">
                  DEMO OTP IS LOGGED IN BACKEND TERMINAL
                </span>
              </div>

              {error && (
                <div className="p-3 bg-[#8F3E3E]/10 border border-[#8F3E3E]/50 text-[#E8E3D5] font-mono text-xs tracking-wider">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-4 bg-[#102B18] border border-[#315F38] text-[#E8E3D5] font-mono text-xs sm:text-sm tracking-[0.2em] uppercase hover:bg-[#315F38] hover:border-[#6F956B] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(49,95,56,0.25)] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{loading ? 'VERIFYING…' : 'VERIFY & ACCESS FARMFLOW'}</span>
                <span className="text-[#6F956B] group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </form>
          )}

          {/* Quick Demo Access Section */}
          <div className="mt-10 pt-8 border-t border-[#1A241B]">
            <span className="block font-mono text-xs sm:text-sm text-[#C7A45A] tracking-[0.25em] uppercase text-center mb-4 font-semibold">
              INSTANT DEMO ACCESS (NO OTP REQUIRED)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleDemoLogin('fpo')}
                disabled={loading}
                className="flex items-center justify-center gap-3 p-4 bg-[#080B08] border border-[#315F38] hover:border-[#6F956B] text-[#E8E3D5] font-mono text-xs tracking-[0.18em] uppercase hover:bg-[#102B18]/60 transition-all cursor-pointer group disabled:opacity-50"
              >
                <span className="text-base">🌾</span>
                <span>ENTER AS DEMO FPO</span>
                <span className="text-[#6F956B] group-hover:translate-x-0.5 transition-transform">→</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('buyer')}
                disabled={loading}
                className="flex items-center justify-center gap-3 p-4 bg-[#080B08] border border-[#C7A45A]/40 hover:border-[#C7A45A] text-[#E8E3D5] font-mono text-xs tracking-[0.18em] uppercase hover:bg-[#2B2310]/60 transition-all cursor-pointer group disabled:opacity-50"
              >
                <span className="text-base">🏪</span>
                <span>ENTER AS DEMO BUYER</span>
                <span className="text-[#C7A45A] group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* System Footer */}
      <footer className="relative z-10 border-t border-[#1A241B] py-6 text-center">
        <div className="max-w-[1360px] mx-auto px-6 font-mono text-[10px] text-[#9A9D91] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>FARMFLOW AI — CAUVERY DELTA AGRICULTURAL COMMAND CENTER</span>
          <span>AUTONOMOUS MULTI-AGENT PIPELINE V0.1</span>
        </div>
      </footer>
    </div>
  );
}
