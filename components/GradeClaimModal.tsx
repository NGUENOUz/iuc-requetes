'use client';

import React, { useState } from 'react';
import {
  X, AlertCircle, ArrowRight, Award, User, BookOpen,
  Calendar, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  if (!isOpen || !gradeData) return null;

  const handleSubmit = () => {
    const reasonText = REASONS.find(r => r.id === selectedReason)?.label || 'Contestation de note';
    const noteDisplay = gradeData.currentGrade !== null ? `${gradeData.currentGrade}/20` : 'Non saisie';

    const fullDescription = `Bonjour,\n\nJe dépose une réclamation officielle pour l'évaluation de ${gradeData.type} concernant l'Unité d'Enseignement suivante :\n\n- Cours : ${gradeData.courseCode} - ${gradeData.courseName}\n- Enseignant responsable : ${gradeData.teacherName}\n- Semestre : ${gradeData.semester} (${gradeData.academicYear || '2025-2026'})\n- Note enregistrée actuellement : ${noteDisplay}\n- Motif principal : ${reasonText}\n\nPrécisions complémentaires :\n${customComment.trim() || 'Je sollicite une vérification auprès du secrétariat académique et de l\'enseignant.'}\n\nMerci pour votre diligence.`;

    const queryParams = new URLSearchParams({
      source: 'releve_notes_popup',
      titre: `Réclamation Note ${gradeData.type} - ${gradeData.courseCode} (${gradeData.courseName})`,
      description: fullDescription,
    });

    onClose();
    router.push(`/nouvelle-requete?${queryParams.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl border border-orange-500/20 bg-white/95 dark:bg-[#121215]/95">
        
        {/* Header Orange Sunset Gradient */}
        <div className="p-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-start justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <span className="glass-badge bg-white/20 border-white/30 text-white px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">
              Procédure Guidée • Recours Académique
            </span>
            <h3 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <AlertCircle size={20} className="text-white" />
              Recours Note de {gradeData.type}
            </h3>
            <p className="text-xs text-orange-100 font-mono">
              {gradeData.courseCode} • {gradeData.courseName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
            title="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Grade Summary Box */}
          <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-500/[0.08] border border-orange-200/70 dark:border-orange-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Enseignant responsable</p>
              <p className="font-bold text-sm text-zinc-900 dark:text-white mt-0.5">{gradeData.teacherName}</p>
              <p className="text-[11px] text-orange-600 dark:text-orange-400 font-mono mt-0.5">
                Semestre {gradeData.semester} • Session {gradeData.type}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Note affichée</span>
              <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                {gradeData.currentGrade !== null ? gradeData.currentGrade : '--'}
                <span className="text-xs text-zinc-400">/20</span>
              </span>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
              1. Sélectionnez le motif de contestation :
            </label>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReason(r.id)}
                  className={`w-full p-3 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    selectedReason === r.id
                      ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                      : 'bg-zinc-50 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-white/5 hover:border-orange-300'
                  }`}
                >
                  <span>{r.label}</span>
                  {selectedReason === r.id && <CheckCircle2 size={16} className="text-white shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
              2. Précisions pour l&apos;enseignant (optionnel) :
            </label>
            <textarea
              rows={2}
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Ex: J'étais présent lors du devoir surveillé le 14 janvier..."
              className="w-full p-3 text-xs rounded-xl glass-input outline-none font-sans resize-none"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-zinc-200/80 dark:border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <span>Continuer vers la requête</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
