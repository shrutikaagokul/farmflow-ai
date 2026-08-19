import React from 'react';

export default function FieldBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* 1. Full-Screen Brightened Backdrop Image */}
      <img
        src="/field-backdrop.jpg"
        alt="FarmFlow Agricultural Field Backdrop"
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 filter brightness-[0.78] contrast-[1.02] saturate-[0.95]"
      />

      {/* 2. Soft Dark-Green Tint Layer (Preserves Golden Sunrise & Field Detail) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080B08]/65 via-[#0D1C11]/35 to-[#080B08]/75 mix-blend-multiply" />

      {/* 3. Soft Translucent Dimmer */}
      <div className="absolute inset-0 bg-[#080B08]/30" />

      {/* 4. Soft Vignette for Edge Feathering */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#080B08_85%)]" />

      {/* 5. Precision Grid & Contour Geometry Overlay */}
      <div className="absolute inset-0 bg-field-grid opacity-25 mix-blend-overlay" />
      <div className="absolute inset-0 bg-field-rows opacity-15" />

      <svg
        className="absolute inset-0 w-full h-full opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="fieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6F956B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#102B18" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <path d="M-100,200 Q400,100 900,350 T1600,280" fill="none" stroke="url(#fieldGrad)" strokeWidth="1" />
        <path d="M-100,350 Q450,260 950,500 T1600,420" fill="none" stroke="url(#fieldGrad)" strokeWidth="1" />
        <path d="M-100,500 Q500,420 1000,650 T1600,580" fill="none" stroke="url(#fieldGrad)" strokeWidth="1" />
        <path d="M-100,650 Q550,580 1050,800 T1600,720" fill="none" stroke="url(#fieldGrad)" strokeWidth="1" />

        <line x1="200" y1="0" x2="350" y2="900" stroke="#315F38" strokeWidth="0.75" strokeDasharray="6 12" />
        <line x1="680" y1="0" x2="850" y2="900" stroke="#315F38" strokeWidth="0.75" strokeDasharray="4 8" />
        <line x1="1100" y1="0" x2="1280" y2="900" stroke="#315F38" strokeWidth="0.75" strokeDasharray="6 12" />
      </svg>

      {/* 6. Subtle Film Texture */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-20" />
    </div>
  );
}

