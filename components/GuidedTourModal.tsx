'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, X, ArrowRight, ArrowLeft, CheckCircle2,
  GraduationCap, CalendarDays, FileText, Zap, ShieldCheck
} from 'lucide-react';

interface GuidedTourModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const STEPS = [
  {
    title: 'Bienvenue sur CampusLite !',
    tag: 'Expérience Guidée',
    subtitle: 'Votre cycle universitaire complet, transparent et centralisé.',
    description:
      'Cette plateforme moderne et universelle a été spécialement pensée pour vous accompagner tout au long de votre parcours académique, quel que soit votre établissement.',
    icon: Sparkles,
    gradient: 'from-orange-500 via-amber-500 to-orange-600',
    features: [
      'Consultation en direct de vos notes de CC et d\'Examens SN',
      'Attribution en temps réel de vos salles de cours et amphis',
      'Dépôt et instruction transparente de toutes vos requêtes administratives',
    ],
  },
  {
    title: 'Notes & Cycle de Vie Universitaire',
    tag: 'Suivi Académique',
    subtitle: 'Évaluations CC, Session Normale et Enseignants attitrés',
    description:
      'Dans l\'onglet "Notes & Cursus", accédez à l\'historique de chaque semestre. Chaque matière affiche le nom de votre enseignant et vous permet de contester une note en 1 clic.',
    icon: GraduationCap,
    gradient: 'from-orange-500 to-amber-500',
    features: [
      'Notes de Contrôle Continu (30%) et Session Normale (70%)',
      'Calcul immédiat de la moyenne semestrielle et des crédits validés',
      'Boutons "Recours CC" et "Recours SN" pour ouvrir un ticket pédagogique instantané',
    ],
  },
  {
    title: 'Planner & Attribution des Salles',
    tag: 'Logistique Campus',
    subtitle: 'Emploi du temps interactif et équipements',
    description:
      'Que vous soyez étudiant ou enseignant, visualisez précisément dans quel amphi ou laboratoire vous êtes programmé et demandez des permutations de salle si nécessaire.',
    icon: CalendarDays,
    gradient: 'from-amber-500 to-orange-500',
    features: [
      'Visualisation des salles (Amphis, Labs informatiques, clim, vidéoprojecteurs)',
      'Filtre par jour de la semaine et par enseignant responsable',
      'Demande de permutation de salle directement adressée au service logistique',
    ],
  },
  {
    title: 'Requêtes & Attestations Express',
    tag: 'Démarches Sécurisées',
    subtitle: 'Documents officiels scellés avec QR code de vérification',
    description:
      'Générez instantanément vos attestations de scolarité ou déposez vos demandes particulières avec suivi de statut SLA en temps réel (En attente, En cours, Résolue).',
    icon: Zap,
    gradient: 'from-orange-600 to-amber-600',
    features: [
      'Délivrance immédiate en moins de 3 secondes avec scellement numérique',
      'Vérification cryptographique par QR code pour les consulats et partenaires',
      'Notifications automatiques à chaque avancée de votre dossier',
    ],
  },
];

export default function GuidedTourModal({ forceOpen = false, onClose }: GuidedTourModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentStep(0);
      return;
    }
    const hasSeen = localStorage.getItem('campuslite_guided_tour_seen') || localStorage.getItem('iuc_guided_tour_seen');
    if (!hasSeen) {
      // Afficher automatiquement après 1.2s de navigation pour une expérience douce
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleClose = () => {
    localStorage.setItem('campuslite_guided_tour_seen', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl border border-orange-500/20 bg-white/95 dark:bg-[#121215]/95 transition-all">
        
        {/* Top Vibrant Orange Sunset Aura Banner */}
        <div className="relative h-32 sm:h-36 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 overflow-hidden flex items-center justify-center p-6 text-white">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/30 rounded-full blur-xl pointer-events-none" />
          
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fermer le guide"
          >
            <X size={16} />
          </button>

          <div className="text-center relative z-10 space-y-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg text-white mb-2">
              <StepIcon size={24} />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
              {step.tag} • Étape {currentStep + 1}/{STEPS.length}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {step.title}
            </h3>
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
              {step.subtitle}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
              {step.description}
            </p>
          </div>

          {/* Checklist feature pills */}
          <div className="space-y-2 pt-1">
            {step.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-orange-500/[0.07] border border-orange-200/60 dark:border-orange-500/15 flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-200"
              >
                <CheckCircle2 size={16} className="text-orange-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>

          {/* Progress Dots and Action Footer */}
          <div className="pt-4 border-t border-zinc-200/80 dark:border-white/10 flex items-center justify-between gap-4">
            
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentStep === i
                      ? 'w-6 bg-orange-500'
                      : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-orange-300'
                  }`}
                  title={`Étape ${i + 1}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Précédent
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <span>{currentStep === STEPS.length - 1 ? 'Commencer' : 'Suivant'}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
