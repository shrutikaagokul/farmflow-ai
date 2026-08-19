import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080B08]/90 backdrop-blur-md border-b border-[#1A241B]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
        {/* Left Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-3.5 h-3.5 bg-[#315F38] border border-[#6F956B]/60 transition-transform duration-300 group-hover:rotate-45" />
          <div className="flex flex-col">
            <span className="font-display text-sm tracking-wider text-[#E8E3D5] leading-none">
              FARMFLOW <span className="text-[#6F956B] italic font-serif">AI</span>
            </span>
            <span className="font-mono text-[9px] text-[#9A9D91] tracking-[0.2em] uppercase mt-0.5 hidden sm:block">
              Autonomous Farm-to-Market Intelligence
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href={isDashboard ? "/#about" : "#about"}
            className="text-[11px] font-mono tracking-[0.18em] text-[#9A9D91] hover:text-[#E8E3D5] uppercase transition-colors"
          >
            About
          </a>
          <a
            href={isDashboard ? "/#intelligence" : "#intelligence"}
            className="text-[11px] font-mono tracking-[0.18em] text-[#9A9D91] hover:text-[#E8E3D5] uppercase transition-colors"
          >
            Intelligence
          </a>
          <Link
            to="/dashboard"
            className={`text-[11px] font-mono tracking-[0.18em] uppercase transition-colors ${
              isDashboard ? 'text-[#C7A45A] font-medium' : 'text-[#9A9D91] hover:text-[#E8E3D5]'
            }`}
          >
            Command Center
          </Link>
        </div>

        {/* Right Status */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex md:hidden text-[10px] font-mono tracking-widest text-[#E8E3D5] border border-[#28382A] px-3 py-1.5 hover:border-[#315F38] transition-colors"
          >
            DASHBOARD →
          </Link>
          <div className="flex items-center gap-2 pl-3 sm:border-l sm:border-[#1A241B]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6F956B] animate-status-dot" />
            <span className="text-[9px] font-mono tracking-[0.22em] text-[#6F956B] uppercase font-medium">
              Live System
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
