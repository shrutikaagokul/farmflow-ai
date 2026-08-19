import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FieldBackground from '../components/FieldBackground';
import { useAuth } from '../context/AuthContext';

const STEPS = { ROLE: 'role', MOBILE: 'mobile', OTP: 'otp' };

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(STEPS.ROLE);
  const [role, setRole] = useState(null);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------------------------
  // Demo Login
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
        login(data.token, data.user);
        navigate(demoRole === 'fpo' ? '/dashboard/fpo' : '/dashboard/buyer');
      } else {
        setError('Demo login failed. Is the backend server running?');
      }
    } catch {
      setError('Connection error. Start the backend: python -m uvicorn server:app --port 8000');
    }
    setLoading(false);
  };

  // -----------------------------------------------------------------------
  // Request OTP
  // -----------------------------------------------------------------------
  const handleRequestOtp = async () => {
    if (mobile.length < 10) {
      setError('Enter a valid mobile number (min 10 digits)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, role }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('http://localhost:8000/api/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, role }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        setStep(STEPS.OTP);
      } else {
        const detail = res ? (await res.json().catch(() => ({}))).detail : null;
        setError(detail || 'Failed to send OTP. Is the backend running?');
      }
    } catch {
      setError('Connection error.');
    }
    setLoading(false);
  };

  // -----------------------------------------------------------------------
  // Verify OTP
  // -----------------------------------------------------------------------
  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError('Enter the OTP sent to your mobile');
      return;
    }
    setLoading(true);
    setError('');
    try {
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

      if (res && res.ok) {
        const data = await res.json();
        login(data.token, data.user);
        navigate(role === 'fpo' ? '/dashboard/fpo' : '/dashboard/buyer');
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
    <div className="min-h-screen bg-[#080B08] text-[#E8E3D5] relative selection:bg-[#315F38]/40">
      <FieldBackground />
      <Navigation />

      <main className="relative z-10 pt-24 pb-20 max-w-[640px] mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-2 h-2 bg-[#6F956B]" />
            <span className="font-mono text-[10px] text-[#9A9D91] tracking-[0.25em] uppercase">
              Authentication
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#E8E3D5] tracking-tight mb-3">
            Welcome to{' '}
            <span className="text-[#6F956B] italic font-serif">FarmFlow</span>
          </h1>
          <p className="text-sm text-[#9A9D91] font-sans max-w-md mx-auto">
            Intelligent decisions for every stage of the farm-to-market journey.
          </p>
        </div>

        {/* ============================================================ */}
        {/* STEP: Role Selection */}
        {/* ============================================================ */}
        {step === STEPS.ROLE && (
          <div className="space-y-6">
            <p className="font-mono text-[10px] text-[#6F956B] tracking-[0.25em] uppercase text-center">
              Select your role
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* FPO Card */}
              <button
                onClick={() => { setRole('fpo'); setStep(STEPS.MOBILE); setError(''); }}
                className="group p-6 bg-[#101510] border border-[#1A241B] hover:border-[#315F38] transition-all duration-300 text-left hover:bg-[#141C14]"
              >
                <span className="text-2xl mb-3 block">🌾</span>
                <span className="font-mono text-xs tracking-[0.18em] text-[#E8E3D5] uppercase block mb-1 font-medium">
                  FPO / Farm Organization
                </span>
                <span className="text-[11px] text-[#9A9D91] font-sans leading-relaxed block">
                  Manage farms, crops and agricultural decisions.
                </span>
              </button>

              {/* Buyer Card */}
              <button
                onClick={() => { setRole('buyer'); setStep(STEPS.MOBILE); setError(''); }}
                className="group p-6 bg-[#101510] border border-[#1A241B] hover:border-[#C7A45A]/50 transition-all duration-300 text-left hover:bg-[#141C14]"
              >
                <span className="text-2xl mb-3 block">🏪</span>
                <span className="font-mono text-xs tracking-[0.18em] text-[#E8E3D5] uppercase block mb-1 font-medium">
                  Buyer / Market
                </span>
                <span className="text-[11px] text-[#9A9D91] font-sans leading-relaxed block">
                  Manage demand, procurement and agricultural supply.
                </span>
              </button>
            </div>

            {/* Demo Login Section */}
            <div className="mt-10 pt-8 border-t border-[#1A241B]">
              <p className="font-mono text-[10px] text-[#C7A45A] tracking-[0.25em] uppercase text-center mb-4">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleDemoLogin('fpo')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#102B18] border border-[#315F38] text-[#E8E3D5] font-mono text-[10px] tracking-[0.18em] uppercase hover:bg-[#315F38] transition-all disabled:opacity-50"
                >
                  <span>🌾</span>
                  <span>Demo FPO</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-[#C7A45A]/20 text-[#C7A45A] text-[8px] tracking-wider rounded-sm">DEMO</span>
                </button>
                <button
                  onClick={() => handleDemoLogin('buyer')}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#101510] border border-[#1A241B] text-[#E8E3D5] font-mono text-[10px] tracking-[0.18em] uppercase hover:border-[#C7A45A]/50 transition-all disabled:opacity-50"
                >
                  <span>🏪</span>
                  <span>Demo Buyer</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-[#C7A45A]/20 text-[#C7A45A] text-[8px] tracking-wider rounded-sm">DEMO</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP: Mobile Number */}
        {/* ============================================================ */}
        {step === STEPS.MOBILE && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => { setStep(STEPS.ROLE); setError(''); }}
                className="font-mono text-[10px] text-[#9A9D91] hover:text-[#E8E3D5] tracking-wider uppercase transition-colors"
              >
                ← Back
              </button>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.18em] uppercase">
                {role === 'fpo' ? '🌾 FPO Login' : '🏪 Buyer Login'}
              </span>
            </div>

            <div className="p-6 bg-[#101510] border border-[#1A241B]">
              <label className="block font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase mb-3">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 15))}
                placeholder="Enter mobile number"
                className="w-full bg-[#080B08] border border-[#1A241B] px-4 py-3 text-[#E8E3D5] font-mono text-sm tracking-wider placeholder:text-[#9A9D91]/50 focus:border-[#315F38] focus:outline-none transition-colors"
                autoFocus
              />
              <button
                onClick={handleRequestOtp}
                disabled={loading || mobile.length < 10}
                className="w-full mt-4 px-4 py-3 bg-[#102B18] border border-[#315F38] text-[#E8E3D5] font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-[#315F38] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending…' : 'Send OTP →'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP: OTP Verification */}
        {/* ============================================================ */}
        {step === STEPS.OTP && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => { setStep(STEPS.MOBILE); setError(''); setOtp(''); }}
                className="font-mono text-[10px] text-[#9A9D91] hover:text-[#E8E3D5] tracking-wider uppercase transition-colors"
              >
                ← Back
              </button>
              <span className="font-mono text-[10px] text-[#6F956B] tracking-[0.18em] uppercase">
                Verify OTP
              </span>
            </div>

            <div className="p-6 bg-[#101510] border border-[#1A241B]">
              <p className="text-xs text-[#9A9D91] mb-4">
                OTP sent to <span className="text-[#E8E3D5] font-mono">{mobile}</span>
                <br />
                <span className="text-[10px] text-[#C7A45A]">Check your server console for the OTP (hackathon mode)</span>
              </p>
              <label className="block font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase mb-3">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-[#080B08] border border-[#1A241B] px-4 py-3 text-[#E8E3D5] font-mono text-lg tracking-[0.5em] text-center placeholder:text-[#9A9D91]/30 focus:border-[#315F38] focus:outline-none transition-colors"
                autoFocus
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 4}
                className="w-full mt-4 px-4 py-3 bg-[#102B18] border border-[#315F38] text-[#E8E3D5] font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-[#315F38] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying…' : 'Verify & Login →'}
              </button>
              <button
                onClick={handleRequestOtp}
                disabled={loading}
                className="w-full mt-2 px-4 py-2 text-[#9A9D91] font-mono text-[10px] tracking-wider uppercase hover:text-[#E8E3D5] transition-colors"
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 border border-[#8F3E3E]/50 bg-[#8F3E3E]/10 text-[#E8E3D5] font-mono text-xs tracking-wider">
            {error}
          </div>
        )}

        {/* Footer link */}
        <div className="mt-10 text-center">
          <Link
            to="/try-demo"
            className="font-mono text-[10px] text-[#9A9D91] tracking-[0.2em] uppercase hover:text-[#6F956B] transition-colors"
          >
            Or try the demo without logging in →
          </Link>
        </div>
      </main>
    </div>
  );
}
