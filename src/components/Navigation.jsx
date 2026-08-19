import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isDemo, logout } = useAuth();

  const activeRole = user?.role || localStorage.getItem('farmflow_demo_role');
  const isBuyerMode = activeRole === 'buyer' || location.pathname === '/dashboard/buyer';

  const handleLogout = async () => {
    localStorage.removeItem('farmflow_demo_role');
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080B08]/95 backdrop-blur-md border-b border-[#1A241B]">
      <div className="max-w-[1536px] mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        {/* Left Brand Lockup */}
        <Link to={isAuthenticated || activeRole ? "/home" : "/"} className="flex items-center gap-3.5 group shrink-0">
          {/* Logo Mark */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            <img
              src="/farmflow-logo.png"
              alt="FarmFlow AI Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain filter drop-shadow-[0_0_8px_rgba(111,149,107,0.3)]"
            />
          </div>

          {/* Brand Name & Tagline */}
          <div className="flex flex-col justify-center">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.04em] text-[#E8E3D5] leading-none whitespace-nowrap">
              FARMFLOW <span className="font-sans text-xs sm:text-sm font-semibold tracking-widest text-[#6F956B] uppercase ml-0.5">AI</span>
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] text-[#9A9D91] tracking-[0.22em] uppercase mt-1 whitespace-nowrap font-medium">
              Field. Flow. Impact.
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10 font-mono text-xs sm:text-[13px] tracking-[0.16em] uppercase">
          {/* Home Link (Always leads to landing page /home) */}
          <Link
            to="/home"
            className={`transition-colors whitespace-nowrap ${
              location.pathname === '/home' || location.pathname === '/' ? 'text-[#6F956B] font-semibold' : 'text-[#9A9D91] hover:text-[#E8E3D5]'
            }`}
          >
            Home
          </Link>

          {isBuyerMode ? (
            /* Buyer-Specific Navbar Items */
            <>
              <Link
                to="/dashboard/buyer"
                className={`transition-colors whitespace-nowrap ${
                  location.pathname === '/dashboard/buyer' ? 'text-[#C7A45A] font-semibold' : 'text-[#9A9D91] hover:text-[#E8E3D5]'
                }`}
              >
                Dashboard
              </Link>
              <a
                href={location.pathname === '/dashboard/buyer' ? "#available-produce" : "/dashboard/buyer#available-produce"}
                className="text-[#9A9D91] hover:text-[#E8E3D5] transition-colors whitespace-nowrap"
              >
                Market
              </a>
            </>
          ) : (
            /* FPO / Default Navbar Items */
            <>
              <a
                href={location.pathname !== '/home' ? "/home#about" : "#about"}
                className="text-[#9A9D91] hover:text-[#E8E3D5] transition-colors whitespace-nowrap"
              >
                About
              </a>
              <a
                href={location.pathname !== '/home' ? "/home#intelligence" : "#intelligence"}
                className="text-[#9A9D91] hover:text-[#E8E3D5] transition-colors whitespace-nowrap"
              >
                Intelligence
              </a>
              <Link
                to="/dashboard"
                className={`transition-colors whitespace-nowrap ${
                  location.pathname === '/dashboard' || location.pathname === '/dashboard/fpo'
                    ? 'text-[#C7A45A] font-semibold'
                    : 'text-[#9A9D91] hover:text-[#E8E3D5]'
                }`}
              >
                Command Center
              </Link>
            </>
          )}
        </div>

        {/* Right: Try Demo CTA / User Login */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {!isBuyerMode && (
            <Link
              to="/try-demo"
              className={`text-xs font-mono tracking-[0.18em] px-4 py-2 border transition-all duration-300 flex items-center gap-2 group whitespace-nowrap ${
                location.pathname === '/try-demo'
                  ? 'bg-[#102B18] border-[#6F956B] text-[#E8E3D5] shadow-[0_0_15px_rgba(111,149,107,0.3)]'
                  : 'bg-[#101510] border-[#315F38] hover:border-[#6F956B] text-[#E8E3D5] hover:bg-[#102B18] hover:shadow-[0_0_15px_rgba(49,95,56,0.3)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#6F956B] animate-pulse shrink-0" />
              <span className="font-semibold whitespace-nowrap">TRY DEMO</span>
              <span className="text-[#6F956B] group-hover:translate-x-0.5 transition-transform hidden sm:inline">→</span>
            </Link>
          )}

          {/* Login / User Profile */}
          {!isAuthenticated ? (
            <Link
              to="/login"
              className={`text-xs font-mono tracking-[0.18em] px-4 py-2 border transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                location.pathname === '/login'
                  ? 'bg-[#102B18] border-[#C7A45A]/60 text-[#C7A45A]'
                  : 'bg-[#101510] border-[#1A241B] hover:border-[#C7A45A]/40 text-[#9A9D91] hover:text-[#E8E3D5]'
              }`}
            >
              <span className="font-semibold whitespace-nowrap">LOGIN</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3.5 py-2 bg-[#101510] border border-[#1A241B] hover:border-[#315F38] transition-all whitespace-nowrap"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isBuyerMode ? 'bg-[#C7A45A]' : 'bg-[#6F956B]'}`} />
                <span className="font-mono text-xs text-[#E8E3D5] tracking-wider hidden sm:inline whitespace-nowrap">
                  {user?.name || (isBuyerMode ? 'Buyer' : 'FPO User')}
                </span>
                {isDemo && (
                  <span className="px-1.5 py-0.5 bg-[#C7A45A]/20 text-[#C7A45A] text-[10px] tracking-wider rounded-sm font-mono uppercase whitespace-nowrap">
                    DEMO
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-[#101510] border border-[#1A241B] hover:border-[#8F3E3E]/50 text-[#9A9D91] hover:text-[#E8E3D5] font-mono text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap"
                title="Logout"
              >
                ✕
              </button>
            </div>
          )}

          {/* System Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#1A241B] whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-[#6F956B] animate-status-dot shrink-0" />
            <span className="text-xs font-mono tracking-[0.2em] text-[#6F956B] uppercase font-bold whitespace-nowrap">
              ● LIVE SYSTEM
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
