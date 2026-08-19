import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FieldBackground from '../components/FieldBackground';
import { useAuth } from '../context/AuthContext';

const Field = ({ label, value }) => (
  <div className="py-4 border-b border-[#1A241B]/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
    <span className="font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase">{label}</span>
    <span className="font-mono text-sm text-[#E8E3D5]">{value || '—'}</span>
  </div>
);

export default function Profile() {
  const { user, isDemo, logout } = useAuth();

  if (!user) return null;

  const isFpo = user.role === 'fpo';

  return (
    <div className="min-h-screen bg-[#080B08] text-[#E8E3D5] relative selection:bg-[#315F38]/40">
      <FieldBackground />
      <Navigation />

      <main className="relative z-10 pt-24 pb-20 max-w-[640px] mx-auto px-6">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className={`w-2 h-2 ${isFpo ? 'bg-[#6F956B]' : 'bg-[#C7A45A]'}`} />
            <span className="font-mono text-[10px] text-[#9A9D91] tracking-[0.25em] uppercase">
              {isFpo ? 'FPO Profile' : 'Buyer Profile'}
            </span>
            {isDemo && (
              <span className="px-2 py-0.5 bg-[#C7A45A]/20 text-[#C7A45A] font-mono text-[8px] tracking-wider uppercase rounded-sm">
                Demo Mode
              </span>
            )}
          </div>
          <h1 className="font-display text-4xl text-[#E8E3D5] tracking-tight">
            {user.name || 'User Profile'}
          </h1>
        </div>

        {/* Profile Card */}
        <div className="p-6 bg-[#101510] border border-[#1A241B]">
          <Field label="Name" value={user.name} />
          <Field label="Mobile" value={user.mobile} />
          <Field label="Role" value={isFpo ? 'FPO / Farm Organization' : 'Buyer / Market'} />
          <Field label="Organization" value={user.organization} />
          <Field label="Location" value={user.location} />

          {isFpo && (
            <>
              <Field label="Farm Region" value={user.location || 'Thanjavur, Tamil Nadu'} />
              <Field label="Primary Crop" value="Paddy / Rice" />
            </>
          )}

          {!isFpo && (
            <>
              <Field label="Market / Location" value={user.location || 'Chennai, Tamil Nadu'} />
            </>
          )}

          <Field label="Account Type" value={isDemo ? 'Demo Account' : 'Authenticated'} />
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={isFpo ? '/dashboard/fpo' : '/dashboard/buyer'}
            className="px-5 py-2.5 bg-[#101510] border border-[#315F38] text-[#E8E3D5] font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-[#315F38] transition-all"
          >
            ← Dashboard
          </Link>
          <button
            onClick={logout}
            className="px-5 py-2.5 bg-[#101510] border border-[#1A241B] text-[#9A9D91] font-mono text-[10px] tracking-[0.2em] uppercase hover:text-[#E8E3D5] hover:border-[#8F3E3E]/50 transition-all"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
