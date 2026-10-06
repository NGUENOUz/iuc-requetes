'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface GuidedTourModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const STEPS = [
  {
    title: 'Bienvenue sur CampusLite',
    tag: 'Prise en main',
    subtitle: 'Ton espace universitaire centralisé et accessible.',
    description:
      'Retrouve tes notes, tes horaires de cours, tes salles d’examen et dépose tes demandes administratives en toute simplicité.',
    features: [
      'Consultation en direct de tes notes de CC et examens',
      'Localisation de tes salles et amphis en temps réel',
      'Suivi étape par étape de tes démarches administratives',
    ],
  },
  {
    title: 'Notes et cursus académique',
    tag: 'Suivi des notes',
    subtitle: 'Évaluations continues, sessions normales et recours',
    description:
      'Dans l’onglet Notes et cursus, retrouve l’historique de tes semestres et conteste une note directement si tu constates une anomalie.',
    features: [
      'Détail des notes de CC (30%) et de Session Normale (70%)',
      'Calcul automatique de la moyenne et des crédits validés',
      'Bouton de réclamation directe sur chaque matière',
    ],
  },
  {
    title: 'Planning et attribution des salles',
    tag: 'Emploi du temps',
    subtitle: 'Visualisation des créneaux et équipements',
    description:
      'Repère instantanément tes salles de cours, les amphis assignés et les équipements disponibles (climatisation, projecteur).',
    features: [
      'Vue quotidienne et hebdomadaire de tes cours',
      'Informations complètes sur la capacité des salles',
      'Demande de permutation directement transmise à la scolarité',
    ],
  },
  {
    title: 'Démarches et attestations',
    tag: 'Secrétariat en ligne',
    subtitle: 'Certificats officiels et suivi de requêtes',
    description:
      'Génère tes attestations de scolarité certifiées avec QR code ou dépose une requête spécifique avec suivi en temps réel.',
    features: [
      'Délivrance immédiate des attestations officielles',
      'Vérification en ligne par code QR officiel',
      'Notifications à chaque étape d’avancement de ton dossier',
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step.title}
      description={`${step.tag} • Étape ${currentStep + 1} sur ${STEPS.length}`}
      footer={
        <div className="flex items-center justify-between w-full">
          {/* Indicateurs de progression */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  currentStep === i ? 'w-5 bg-accent' : 'w-1.5 bg-line'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrev}
                leftIcon={<ArrowLeft size={14} />}
              >
                Précédent
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={<ArrowRight size={14} />}
            >
              {currentStep === STEPS.length - 1 ? 'Terminer' : 'Suivant'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-accent">{step.subtitle}</p>
          <p className="text-xs text-fg-muted mt-1 leading-relaxed">
            {step.description}
          </p>
        </div>

        <div className="space-y-2 pt-1">
          {step.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-surface-muted/60 border border-line flex items-start gap-2.5 text-xs text-fg"
            >
              <CheckCircle2 size={15} className="text-accent shrink-0 mt-0.5" />
              <span className="leading-snug">{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
