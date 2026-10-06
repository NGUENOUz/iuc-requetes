'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Footprints, Layers, Compass } from 'lucide-react';
import Button from './Button';

export interface CampusMiniMapProps {
  roomName: string;
  buildingName?: string;
  floor?: string;
  className?: string;
}

export default function CampusMiniMap({
  roomName,
  buildingName = 'Bâtiment Principal (Pôle A)',
  floor = '1er Étage',
  className = '',
}: CampusMiniMapProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  // Coordonnées approximatives selon le type de salle
  const isAmphi = roomName.toLowerCase().includes('amphi');
  const isLab = roomName.toLowerCase().includes('lab') || roomName.toLowerCase().includes('info');

  const destX = isAmphi ? 320 : isLab ? 140 : 250;
  const destY = isAmphi ? 110 : isLab ? 90 : 130;
  const userX = 70;
  const userY = 220;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* En-tête info GPS & Itinéraire */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-line/60">
        <div className="flex items-center gap-1.5 font-semibold text-fg">
          <Navigation size={14} className="text-accent" />
          <span>Guidage Campus GPS</span>
        </div>
        <div className="flex items-center gap-2 text-fg-muted font-mono text-[11px]">
          <span className="flex items-center gap-1 text-accent font-semibold">
            <Footprints size={12} /> ~140 m (2 min à pied)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Layers size={12} /> {floor}
          </span>
        </div>
      </div>

      {/* Plan isométrique 3D stylisé vectoriel */}
      <div className="relative w-full h-56 sm:h-64 rounded-lg bg-surface-muted border border-line overflow-hidden select-none">
        
        {/* Grille isométrique de perspective 3D */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--fg-muted) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Bâtiments du campus en 3D vectorielle isométrique */}
        <svg
          viewBox="0 0 400 280"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Dégradés 3D pour les volumes des bâtiments */}
            <linearGradient id="buildingTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--surface)" />
              <stop offset="100%" stopColor="var(--surface-raised)" />
            </linearGradient>
            <linearGradient id="buildingSide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--line)" />
              <stop offset="100%" stopColor="var(--surface-muted)" />
            </linearGradient>
          </defs>

          {/* Allées piétonnes du campus */}
          <path
            d="M 50 240 L 180 180 L 330 180 L 350 110"
            fill="none"
            stroke="var(--line)"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />

          {/* Tracé de l'itinéraire piéton en pointillés animés */}
          <motion.path
            d={`M ${userX} ${userY} Q 180 190, ${destX} ${destY}`}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeDasharray="6 6"
            animate={isNavigating ? { strokeDashoffset: -24 } : {}}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          />

          {/* Bâtiment Ouest : Pôle Informatique & Labos */}
          <g transform="translate(100, 70)">
            <polygon points="0,30 40,10 80,30 40,50" fill="url(#buildingTop)" stroke="var(--line)" />
            <polygon points="0,30 40,50 40,80 0,60" fill="url(#buildingSide)" stroke="var(--line)" />
            <polygon points="40,50 80,30 80,60 40,80" fill="url(#buildingSide)" stroke="var(--line)" opacity="0.8" />
            <text x="40" y="42" fontSize="8" fill="var(--fg-muted)" textAnchor="middle" fontWeight="bold">
              Labos Info
            </text>
          </g>

          {/* Bâtiment Central : Pôle Pédagogique */}
          <g transform="translate(200, 110)">
            <polygon points="0,35 50,10 100,35 50,60" fill="url(#buildingTop)" stroke="var(--line)" />
            <polygon points="0,35 50,60 50,95 0,70" fill="url(#buildingSide)" stroke="var(--line)" />
            <polygon points="50,60 100,35 100,70 50,95" fill="url(#buildingSide)" stroke="var(--line)" opacity="0.8" />
            <text x="50" y="48" fontSize="8" fill="var(--fg-muted)" textAnchor="middle" fontWeight="bold">
              Pôle A
            </text>
          </g>

          {/* Bâtiment Est : Grand Amphi 500 / 300 */}
          <g transform="translate(280, 80)">
            <polygon points="0,30 45,8 90,30 45,52" fill="url(#buildingTop)" stroke="var(--line)" />
            <polygon points="0,30 45,52 45,85 0,63" fill="url(#buildingSide)" stroke="var(--line)" />
            <polygon points="45,52 90,30 90,63 45,85" fill="url(#buildingSide)" stroke="var(--line)" opacity="0.8" />
            <text x="45" y="42" fontSize="8" fill="var(--fg-muted)" textAnchor="middle" fontWeight="bold">
              Amphis
            </text>
          </g>

          {/* POINT DÉPART (L'Étudiant) */}
          <g transform={`translate(${userX}, ${userY})`}>
            {/* Halo pulsant */}
            <circle cx="0" cy="0" r="14" fill="var(--accent)" opacity="0.18">
              <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="0" cy="0" r="6" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />
          </g>

          {/* POINT ARRIVÉE (La Salle Ciblée) */}
          <g transform={`translate(${destX}, ${destY})`}>
            <circle cx="0" cy="0" r="12" fill="var(--danger-bg)" />
            <circle cx="0" cy="0" r="5" fill="var(--danger-fg)" />
          </g>
        </svg>

        {/* Label départ flottant */}
        <div
          className="absolute z-10 px-2 py-0.5 rounded-md bg-surface border border-line shadow-xs text-[10px] font-semibold text-fg flex items-center gap-1 -translate-x-1/2 -translate-y-8 pointer-events-none"
          style={{ left: `${(userX / 400) * 100}%`, top: `${(userY / 280) * 100}%` }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span>Hall d&apos;accueil</span>
        </div>

        {/* Label destination flottant */}
        <div
          className="absolute z-10 px-2.5 py-1 rounded-md bg-surface border-2 border-accent shadow-md text-xs font-bold text-accent flex items-center gap-1.5 -translate-x-1/2 -translate-y-9 pointer-events-none"
          style={{ left: `${(destX / 400) * 100}%`, top: `${(destY / 280) * 100}%` }}
        >
          <MapPin size={12} className="text-accent" />
          <span>{roomName}</span>
        </div>

        {/* Boussole d'orientation */}
        <div className="absolute bottom-2 right-2 p-1.5 rounded-md bg-surface/90 border border-line/80 text-[10px] text-fg-muted font-mono flex items-center gap-1">
          <Compass size={12} className="text-accent" />
          <span>Nord Campus</span>
        </div>
      </div>

      {/* Détail d'accès & Bouton d'action */}
      <div className="p-3 rounded-lg bg-surface-muted/60 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <p className="font-semibold text-fg">
            Localisation : {buildingName}
          </p>
          <p className="text-fg-muted">
            Prendre les escaliers centraux ou ascenseur Nord • Niveau {floor}
          </p>
        </div>

        <Button
          variant={isNavigating ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setIsNavigating(!isNavigating)}
          leftIcon={<Navigation size={13} />}
        >
          {isNavigating ? 'Itinéraire actif' : 'Lancer le guidage'}
        </Button>
      </div>
    </div>
  );
}
