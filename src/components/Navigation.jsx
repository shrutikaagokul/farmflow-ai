import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

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
            href={location.pathname !== '/' ? "/#about" : "#about"}
            className="text-[11px] font-mono tracking-[0.18em] text-[#9A9D91] hover:text-[#E8E3D5] uppercase transition-colors"
          >
            About
          </a>
          <a
            href={location.pathname !== '/' ? "/#intelligence" : "#intelligence"}
            className="text-[11px] font-mono tracking-[0.18em] text-[#9A9D91] hover:text-[#E8E3D5] uppercase transition-colors"
          >
            Intelligence
          </a>
          <Link
            to="/dashboard"
            className={`text-[11px] font-mono tracking-[0.18em] uppercase transition-colors ${
              location.pathname === '/dashboard' ? 'text-[#C7A45A] font-medium' : 'text-[#9A9D91] hover:text-[#E8E3D5]'
            }`}
          >
            Command Center
          </Link>
          <Link
            to="/try-demo"
            className={`text-[11px] font-mono tracking-[0.18em] uppercase transition-colors ${
              location.pathname === '/try-demo' ? 'text-[#6F956B] font-medium' : 'text-[#9A9D91] hover:text-[#E8E3D5]'
            }`}
          >
            Try Demo
          </Link>
        </div>

        {/* Right Status & Try Demo CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/try-demo"
            className={`text-[10px] font-mono tracking-[0.2em] px-3.5 py-1.5 border transition-all duration-300 flex items-center gap-2 group ${
              location.pathname === '/try-demo'
                ? 'bg-[#102B18] border-[#6F956B] text-[#E8E3D5] shadow-[0_0_15px_rgba(111,149,107,0.3)]'
                : 'bg-[#101510] border-[#315F38] hover:border-[#6F956B] text-[#E8E3D5] hover:bg-[#102B18] hover:shadow-[0_0_15px_rgba(49,95,56,0.3)]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F956B] animate-pulse" />
            <span className="font-semibold">TRY DEMO</span>
            <span className="text-[#6F956B] group-hover:translate-x-0.5 transition-transform hidden sm:inline">→</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#1A241B]">
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
