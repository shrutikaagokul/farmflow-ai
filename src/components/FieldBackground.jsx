import React from 'react';

export default function FieldBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Background grid */}
      <div className="absolute inset-0 bg-field-grid opacity-60" />
      <div className="absolute inset-0 bg-field-rows opacity-40" />

      {/* Subtle aerial agricultural geometry SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035]"
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

        {/* Contour lines representing field elevation and plot partitions */}
        <path d="M-100,200 Q400,100 900,350 T1600,280" fill="none" stroke="url(#fieldGrad)" strokeWidth="1" />
        <path d="M-100,350 Q450,260 950,500 T1600,420" fill="none" stroke="url(#fieldGrad)" strokeWidth="1" />
        <path d="M-100,500 Q500,420 1000,650 T1600,580" fill="none" stroke="url(#fieldGrad)" strokeWidth="1" />
        <path d="M-100,650 Q550,580 1050,800 T1600,720" fill="none" stroke="url(#fieldGrad)" strokeWidth="1" />

        {/* Diagonal parcel lines */}
        <line x1="200" y1="0" x2="350" y2="900" stroke="#315F38" strokeWidth="0.75" strokeDasharray="6 12" />
        <line x1="680" y1="0" x2="850" y2="900" stroke="#315F38" strokeWidth="0.75" strokeDasharray="4 8" />
        <line x1="1100" y1="0" x2="1280" y2="900" stroke="#315F38" strokeWidth="0.75" strokeDasharray="6 12" />
      </svg>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#080B08_95%)]" />

      {/* Grain overlay */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-40" />
    </div>
  );
}
