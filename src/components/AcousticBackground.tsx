import React from 'react';

/**
 * AcousticBackground
 * Renders an ultra-subtle, high-precision acoustic vector atmosphere
 * (3–6% opacity harmonic waveforms, sound-field geometry, and spectral coordinates)
 * with zero layout overhead and zero animation battery drain.
 */
export const AcousticBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full opacity-[0.04] dark:opacity-[0.035] text-[#123C32] dark:text-[#A7B9A3] transition-opacity duration-700"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="bgGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C6A66A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#315A43" stopOpacity="0.2" />
          </linearGradient>

          <pattern id="acousticGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
            <circle cx="0" cy="0" r="0.8" fill="#C6A66A" opacity="0.6" />
          </pattern>
        </defs>

        {/* Ambient Acoustic Grid Texture */}
        <rect width="1440" height="900" fill="url(#acousticGrid)" opacity="0.6" />

        {/* Fundamental Harmonic Curves (F0/F1 Trajectories) */}
        <g fill="none" stroke="currentColor" strokeWidth="1.2">
          {/* Curve 1: Low frequency formant sweep */}
          <path
            d="M -100 220 
               C 240 180, 480 340, 720 260 
               C 960 180, 1200 320, 1540 240"
            stroke="url(#bgGoldGrad)"
            strokeWidth="1.6"
          />

          {/* Curve 2: Inverted vocal energy envelope */}
          <path
            d="M -50 380 
               C 220 440, 520 280, 800 360 
               C 1080 440, 1320 300, 1520 380"
            strokeDasharray="4 6"
            opacity="0.8"
          />

          {/* Curve 3: Upper overtone resonance */}
          <path
            d="M 0 520 
               C 340 500, 680 620, 1020 540 
               C 1260 480, 1400 580, 1500 560"
            opacity="0.6"
          />
        </g>

        {/* Sound-field Radial Spheres (Centered gently in top-right ambient quadrant) */}
        <g
          transform="translate(1180, 240)"
          fill="none"
          stroke="#C6A66A"
          strokeWidth="0.8"
          opacity="0.6"
        >
          <circle cx="0" cy="0" r="90" strokeDasharray="3 5" />
          <circle cx="0" cy="0" r="180" strokeDasharray="4 8" />
          <circle cx="0" cy="0" r="280" strokeDasharray="2 10" />
          <line x1="-320" y1="0" x2="320" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          <line x1="0" y1="-320" x2="0" y2="320" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
};
