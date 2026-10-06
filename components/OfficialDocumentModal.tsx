'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import Button from '@/components/ui/Button';

interface OfficialDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    type: string;
    title: string;
    code: string;
    date: string;
    requesterName: string;
    matricule: string;
    programOrFunction: string;
    academicYear?: string;
  };
}

export default function OfficialDocumentModal({ isOpen, onClose, document }: OfficialDocumentModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isAttestationTravail =
    document.code?.startsWith('ATT-TRAV') || document.title?.toLowerCase().includes('travail');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-overlay overflow-y-auto">
      {/* Container A4 */}
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-overlay overflow-hidden my-auto border border-line">
        
        {/* Modal Top Actions (Masqué à l'impression) */}
        <div className="print:hidden bg-surface border-b border-line px-5 py-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-xs text-fg">
              Attestation officielle certifiée
            </h3>
            <p className="text-[11px] font-mono text-fg-muted">
              Réf : {document.code}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              type="button"
              variant="primary"
              size="sm"
              leftIcon={<Printer size={14} />}
            >
              Imprimer / PDF
            </Button>
            <Button
              onClick={onClose}
              type="button"
              variant="ghost"
              size="sm"
            >
              Fermer
            </Button>
          </div>
        </div>

        {/* ── DOCUMENT OFFICIEL IMPRIMABLE (Format A4 standardisé) ── */}
        <div className="p-8 sm:p-12 bg-white text-slate-900 font-serif leading-relaxed relative print:p-0 print:m-0">
          
          {/* Filigrane d'authenticité */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <span className="text-8xl font-black font-sans uppercase -rotate-45 tracking-widest text-slate-900">
              CAMPUSLITE
            </span>
          </div>

          {/* En-tête officiel */}
          <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center text-xs tracking-wider">
            <div className="flex justify-between items-start gap-4">
              <div className="text-left font-sans text-[11px] leading-tight text-slate-700">
                <p className="font-extrabold text-slate-900">RÉPUBLIQUE UNIVERSITAIRE</p>
                <p className="italic text-slate-500">Excellence - Innovation - Avenir</p>
                <div className="w-12 h-0.5 bg-slate-900 my-1" />
                <p className="font-semibold text-slate-800">MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR</p>
              </div>

              {/* Monogramme officiel */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg font-sans">
                  CL
                </div>
                <span className="text-[10px] font-sans font-bold text-slate-900 mt-1 uppercase tracking-wider">
                  CampusLite
                </span>
              </div>

              <div className="text-right font-sans text-[11px] leading-tight text-slate-700">
                <p className="font-extrabold text-slate-900">HIGHER EDUCATION SYSTEM</p>
                <p className="italic text-slate-500">Excellence - Innovation - Future</p>
                <div className="w-12 h-0.5 bg-slate-900 my-1 ml-auto" />
                <p className="font-semibold text-slate-800">ACADEMIC REGISTRY</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <h2 className="text-sm font-sans font-bold tracking-wider uppercase text-slate-900">
                INSTITUT UNIVERSITAIRE DE FORMATION SUPÉRIEURE
              </h2>
              <p className="font-sans text-[10px] text-slate-600">
                Service Centralisé de Certification et de Contrôle Académique
              </p>
            </div>
          </div>

          {/* Titre du document */}
          <div className="text-center my-6">
            <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight underline decoration-slate-900 decoration-2 underline-offset-8">
              {isAttestationTravail ? 'ATTESTATION DE SERVICE' : 'ATTESTATION DE SCOLARITÉ'}
            </h1>
            <p className="text-xs font-sans text-slate-500 mt-3 font-mono">
              IDENTIFIANT D’AUTHENTICITÉ : <strong className="text-slate-900">{document.code}</strong>
            </p>
          </div>

          {/* Corps de texte */}
          <div className="text-sm sm:text-base leading-relaxed text-justify space-y-4 my-8 text-slate-800">
            <p>
              Le Directeur des Affaires Académiques et de la Scolarité de l’établissement soussigné, certifie par la présente que :
            </p>

            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 font-sans my-4 space-y-2">
              <div className="flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-500 font-medium">BÉNÉFICIAIRE :</span>
                <span className="font-bold text-slate-900 text-sm uppercase">{document.requesterName}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-500 font-medium">MATRICULE :</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{document.matricule}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-500 font-medium">
                  {isAttestationTravail ? 'FONCTION :' : 'FILIÈRE / NIVEAU :'}
                </span>
                <span className="font-semibold text-slate-800 text-sm">{document.programOrFunction}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-xs text-slate-500 font-medium">ANNÉE ACADÉMIQUE :</span>
                <span className="font-semibold text-slate-800 text-sm">{document.academicYear || '2025-2026'}</span>
              </div>
            </div>

            <p>
              {isAttestationTravail
                ? 'Exerce ses fonctions d’enseignement et de recherche au sein de l’établissement au titre de l’année académique en cours.'
                : 'Est régulièrement inscrit(e) sur les registres de scolarité de l’établissement au titre de l’année académique en cours.'}
            </p>

            <p className="italic text-slate-700">
              En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.
            </p>
          </div>

          {/* Sceau & QR Code */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-md p-2 flex flex-col items-center justify-center text-center">
                <div className="grid grid-cols-3 gap-1 w-full h-full p-0.5 border border-white/20">
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                </div>
              </div>
              <div className="font-sans text-[11px] text-slate-500">
                <p className="font-bold text-slate-900">Scellement Numérique</p>
                <p className="font-mono text-[10px]">campuslite.edu/verify/{document.code}</p>
              </div>
            </div>

            <div className="text-right font-sans">
              <p className="text-xs text-slate-600 mb-1">Délivré le {document.date || '01 Octobre 2026'}</p>
              <p className="text-xs font-bold text-slate-900 uppercase">La Direction des Études</p>
              <div className="inline-block relative my-2">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-900 flex items-center justify-center rotate-12 text-slate-900 text-[8px] font-black uppercase text-center p-1">
                  SCEAU OFFICIEL<br />DIRECTION DES ÉTUDES
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
