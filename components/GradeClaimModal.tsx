'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import StatusBadge from '@/components/ui/StatusBadge';

interface GradeClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeData: {
    courseCode: string;
    courseName: string;
    teacherName: string;
    type: 'CC' | 'SN';
    currentGrade: number | null;
    semester: string;
    academicYear?: string;
  } | null;
}

const REASONS = [
  { id: 'report_error', label: 'Erreur matérielle de report de note sur le relevé' },
  { id: 'missing_paper', label: 'Copie non répertoriée ou absence erronée' },
  { id: 'review_request', label: 'Demande de consultation de copie et barème' },
];

export default function GradeClaimModal({ isOpen, onClose, gradeData }: GradeClaimModalProps) {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string>('report_error');
  const [customComment, setCustomComment] = useState<string>('');

  if (!gradeData) return null;

  const handleSubmit = () => {
    const reasonText =
      REASONS.find((r) => r.id === selectedReason)?.label || 'Contestation de note';
    const noteDisplay =
      gradeData.currentGrade !== null ? `${gradeData.currentGrade}/20` : 'Non saisie';

    const fullDescription = `Bonjour,\n\nJe dépose une réclamation officielle pour l'évaluation de ${
      gradeData.type
    } concernant l'Unité d'Enseignement suivante :\n\n- Cours : ${gradeData.courseCode} - ${
      gradeData.courseName
    }\n- Enseignant responsable : ${gradeData.teacherName}\n- Semestre : ${
      gradeData.semester
    } (${
      gradeData.academicYear || '2025-2026'
    })\n- Note enregistrée actuellement : ${noteDisplay}\n- Motif principal : ${reasonText}\n\nPrécisions complémentaires :\n${
      customComment.trim() ||
      "Je sollicite une vérification auprès du secrétariat académique et de l'enseignant."
    }\n\nMerci pour votre diligence.`;

    const queryParams = new URLSearchParams({
      source: 'releve_notes_popup',
      titre: `Réclamation Note ${gradeData.type} - ${gradeData.courseCode} (${gradeData.courseName})`,
      description: fullDescription,
    });

    onClose();
    router.push(`/nouvelle-requete?${queryParams.toString()}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Recours sur la note de ${gradeData.type}`}
      description={`${gradeData.courseCode} • ${gradeData.courseName}`}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>
            Préparer ma réclamation
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Résumé de l'évaluation */}
        <div className="p-4 rounded-lg bg-surface-muted border border-line flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-fg-muted">Enseignant responsable</p>
            <p className="font-semibold text-sm text-fg">{gradeData.teacherName}</p>
            <p className="text-xs text-fg-secondary">
              Semestre {gradeData.semester} • Évaluation {gradeData.type}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-fg-muted block">Note actuelle</span>
            <span className="text-2xl font-bold text-fg tabular">
              {gradeData.currentGrade !== null ? gradeData.currentGrade : '—'}
              <span className="text-xs text-fg-muted font-normal"> / 20</span>
            </span>
          </div>
        </div>

        {/* Choix du motif */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-fg uppercase tracking-wider">
            Motif de la contestation
          </label>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label
                key={r.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                  selectedReason === r.id
                    ? 'bg-accent-soft border-accent text-fg font-medium'
                    : 'bg-surface border-line text-fg-secondary hover:bg-surface-hover hover:text-fg'
                }`}
              >
                <input
                  type="radio"
                  name="claim_reason"
                  checked={selectedReason === r.id}
                  onChange={() => setSelectedReason(r.id)}
                  className="mt-0.5"
                />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Commentaire optionnel */}
        <div className="space-y-1">
          <Textarea
            label="Précisions complémentaires (facultatif)"
            placeholder="Détaillez les raisons de votre contestation (ex: numéro de table, sujet, anomalie constatée)..."
            rows={3}
            value={customComment}
            onChange={(e) => setCustomComment(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
