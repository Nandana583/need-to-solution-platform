import React from 'react';

/**
 * SolveneraLogo — Premium brand mark for Solvenera
 *
 * Visual identity: Connected S-form in emerald/teal (solution path)
 * with a warm coral/amber accent arc (community/need path).
 * Central pivot symbolises connection between need & solution.
 *
 * Palette: Emerald → Teal → Mint (primary), Coral → Peach (accent)
 * NO blue, violet, or purple.
 */
export const SolveneraLogo = ({
  className = 'w-8 h-8',
  showText = false,
  textClassName = 'text-xl',
}) => {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} shrink-0 transition-transform duration-300`}
        aria-label="Solvenera logo"
        role="img"
      >
        <defs>
          {/* Primary: Emerald → Teal gradient */}
          <linearGradient id="sg-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#047857" />
            <stop offset="55%"  stopColor="#059669" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>

          {/* Accent: Coral → Peach gradient */}
          <linearGradient id="sg-accent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#b3592a" />
            <stop offset="50%"  stopColor="#e07a5f" />
            <stop offset="100%" stopColor="#f4a261" />
          </linearGradient>

          {/* Soft emerald shadow filter */}
          <filter id="sg-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="3" floodColor="#059669" floodOpacity="0.25" />
          </filter>

          {/* Subtle accent shadow */}
          <filter id="sg-glow-accent" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#e07a5f" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* ─── Primary Solution Path (S-ribbon, Emerald) ─── */}
        <path
          d="M 57 13 C 73 13 85 23 85 37 C 85 53 65 59 49 63 C 33 67 21 73 21 83 C 21 92 29.5 97 40 97 C 54 97 64.5 89.5 69.5 81.5 C 71 78.5 74.5 77 77.5 79 C 80.5 81 80.5 85.5 77 90 C 69 100.5 53.5 104 40 104 C 23.5 104 11.5 95 11.5 81 C 11.5 64 31.5 58 47.5 54 C 63.5 50 75.5 45 75.5 35 C 75.5 27 67.5 20 55.5 20 C 43.5 20 33.5 26 29 34 C 27.5 37 23 38 20 36 C 17 34 16.5 30 19.5 26 C 26.5 15 41 13 57 13 Z"
          fill="url(#sg-primary)"
          filter="url(#sg-glow)"
        />

        {/* ─── Community/Need Path (counter-arc, Coral) ─── */}
        <path
          d="M 43 87 C 27 87 15 77 15 63 C 15 47 35 41 51 37 C 67 33 79 27 79 17 C 79 8 71 3 61 3 C 47 3 36 11 31 19 C 29.5 22 26 23 23 21 C 20 19 20 15 24 10 C 32 0 47 -4 61 -4 C 77 -4 89 5 89 19 C 89 36 69 42 53 46 C 37 50 25 55 25 65 C 25 73 33 80 45 80 C 57 80 67 74 71 66 C 72.5 63 77 62 80 64 C 83 66 84 70 81 74 C 74 85 59.5 87 43 87 Z"
          fill="url(#sg-accent)"
          opacity="0.8"
          filter="url(#sg-glow-accent)"
        />

        {/* ─── Central Pivot Node (connection point) ─── */}
        <circle cx="50" cy="50" r="6.5" fill="#10b981" opacity="0.95" />
        <circle cx="50" cy="50" r="3"   fill="#ffffff" />
        <circle cx="50" cy="50" r="1.5" fill="#047857" />
      </svg>

      {showText && (
        <span
          className={`font-extrabold tracking-tight ${textClassName}`}
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #0d9488 55%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Solvenera
        </span>
      )}
    </div>
  );
};
