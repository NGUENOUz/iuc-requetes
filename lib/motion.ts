import { type Transition, type Variants } from 'motion/react';

// Durées normalisées en secondes
export const DURATION = {
  micro: 0.12,      // 120ms
  interface: 0.20,  // 200ms
  entrance: 0.35,   // 350ms
  chart: 0.70,      // 700ms
} as const;

// Courbes de transition normalisées
export const EASE = {
  entrance: [0.22, 1, 0.36, 1], // ease-out moderne
  move: [0.4, 0, 0.2, 1],       // standard smooth
  spring: { type: 'spring', stiffness: 260, damping: 28 },
} as const;

export const transitionEntrance: Transition = {
  duration: DURATION.entrance,
  ease: EASE.entrance,
};

export const transitionInterface: Transition = {
  duration: DURATION.interface,
  ease: EASE.entrance,
};

// Variants de cascade pour l'entrée de page
export const containerStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.entrance,
      ease: EASE.entrance,
    },
  },
};

// Carte cliquable avec micro-élévation de 2px max
export const cardInteractiveProps = {
  whileHover: { y: -2, transition: { duration: DURATION.interface, ease: EASE.entrance } },
  whileTap: { y: 0, scale: 0.99, transition: { duration: DURATION.micro } },
};
