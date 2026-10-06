'use client';

import React from 'react';

export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden select-none"
      style={{
        background: `
          radial-gradient(ellipse 65% 55% at 15% 10%, var(--ambient-orb-1) 0%, transparent 70%),
          radial-gradient(ellipse 60% 50% at 85% 85%, var(--ambient-orb-2) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 50% 45%, var(--ambient-orb-3) 0%, transparent 60%),
          var(--bg)
        `,
      }}
    >
      {/* Léger grain SVG subtil anti-banding (3-4% opacité) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
