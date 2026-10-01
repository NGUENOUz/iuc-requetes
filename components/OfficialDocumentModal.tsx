'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Award } from 'lucide-react';

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

  const isAttestationTravail = document.code?.startsWith('ATT-TRAV') || document.title?.toLowerCase().includes('travail');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      {/* Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200">
        
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="print:hidden bg-[#09090b] text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <h3 className="font-bold text-xs uppercase tracking-wider font-mono text-zinc-200">
              Certificat Officiel Numérique CampusLite
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-zinc-200 font-bold text-xs rounded-lg transition-all shadow-sm"
            >
              <Printer size={14} />
              Imprimer / Enregistrer PDF
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            DOCUMENT OFFICIEL IMPRIMABLE (Format A4 Stylisé)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="p-8 sm:p-12 bg-white text-slate-900 font-serif leading-relaxed relative print:p-0 print:m-0">
          
          {/* Filigrane discret d'authenticité */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <span className="text-9xl font-black font-sans uppercase -rotate-45 tracking-widest text-slate-900">
              CAMPUSLITE
            </span>
          </div>

          {/* En-tête officiel République / Ministère / Université */}
          <div className="border-b-2 border-emerald-800 pb-6 mb-8 text-center text-xs tracking-wider">
            <div className="flex justify-between items-start gap-4">
              <div className="text-left font-sans text-[11px] leading-tight text-slate-700">
                <p className="font-extrabold text-slate-900">RÉPUBLIQUE UNIVERSITAIRE</p>
                <p className="italic text-slate-500">Excellence - Innovation - Avenir</p>
                <div className="w-12 h-0.5 bg-emerald-600 my-1" />
                <p className="font-semibold text-slate-800">MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR</p>
              </div>

              {/* Armoiries / Logo CampusLite */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-green-600 text-white flex items-center justify-center font-black text-xl font-sans shadow-md">
                  CL
                </div>
                <span className="text-[10px] font-sans font-bold text-emerald-800 mt-1 uppercase tracking-widest">
                  Pôle Académique
                </span>
              </div>

              <div className="text-right font-sans text-[11px] leading-tight text-slate-700">
                <p className="font-extrabold text-slate-900">HIGHER EDUCATION SYSTEM</p>
                <p className="italic text-slate-500">Excellence - Innovation - Future</p>
                <div className="w-12 h-0.5 bg-emerald-600 my-1 ml-auto" />
                <p className="font-semibold text-slate-800">CAMPUSLITE NETWORK</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <h2 className="text-sm font-sans font-black tracking-wider uppercase text-slate-900">
                RÉSEAU UNIVERSITAIRE CAMPUSLITE
              </h2>
              <p className="font-sans text-[10px] text-slate-600">
                Campus Universitaire | Système Centralisé de Contrôle et de Certification Numérique
              </p>
            </div>
          </div>

          {/* Titre du document */}
          <div className="text-center my-8">
            <span className="inline-block px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full mb-3">
              Document Officiel Certifié
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight underline decoration-emerald-600 decoration-2 underline-offset-8">
              {isAttestationTravail ? 'ATTESTATION DE TRAVAIL & SERVICE' : 'ATTESTATION DE SCOLARITÉ'}
            </h1>
            <p className="text-xs font-sans text-slate-500 mt-3 font-mono">
              RÉFÉRENCE D'AUTHENTICITÉ : <strong className="text-slate-900">{document.code}</strong>
            </p>
          </div>

          {/* Corps de texte de l'attestation */}
          <div className="text-sm sm:text-base leading-relaxed text-justify space-y-4 my-8 text-slate-800">
            <p>
              Le Directeur des Affaires Académiques et de la Scolarité de l'établissement soussigné, certifie par la présente que :
            </p>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 font-sans my-4 space-y-2">
              <div className="flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-500 font-medium">BÉNÉFICIAIRE :</span>
                <span className="font-bold text-slate-900 text-sm uppercase">{document.requesterName}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-500 font-medium">MATRICULE / IDENTIFIANT :</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{document.matricule}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="text-xs text-slate-500 font-medium">{isAttestationTravail ? 'FONCTION / DISCIPLINE :' : 'FILIÈRE / NIVEAU :'}</span>
                <span className="font-semibold text-slate-800 text-sm">{document.programOrFunction}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-xs text-slate-500 font-medium">ANNÉE ACADÉMIQUE :</span>
                <span className="font-semibold text-slate-800 text-sm">{document.academicYear || '2025-2026'}</span>
              </div>
            </div>

            <p>
              {isAttestationTravail
                ? "Est dûment membre du corps enseignant / personnel de l'établissement pour l'année académique 2025-2026 et exerce ses fonctions en conformité avec les dispositions statutaires de l'Institut."
                : "Est régulièrement inscrit(e) sur les registres de scolarité de l'Institut Universitaire de la Côte au titre de l'année académique en cours."}
            </p>

            <p className="italic text-slate-700">
              En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.
            </p>
          </div>

          {/* Pied de page et Signature */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-end justify-between gap-6">
            
            {/* QR Code de vérification numérique */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-inner">
                <div className="grid grid-cols-4 gap-1 w-full h-full p-1 border border-white/20">
                  <div className="bg-white rounded-xs" />
                  <div className="bg-emerald-400 rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-emerald-400 rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-emerald-400 rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-emerald-400 rounded-xs" />
                  <div className="bg-white rounded-xs" />
                </div>
              </div>
              <div className="font-sans text-[11px] text-slate-500">
                <p className="font-bold text-slate-900">Vérification Numérique</p>
                <p>Scannez pour valider</p>
                <p className="font-mono text-emerald-700 text-[10px]">campuslite.edu/verify/{document.code}</p>
              </div>
            </div>

            {/* Sceau officiel & Signature */}
            <div className="text-right font-sans">
              <p className="text-xs text-slate-600 mb-1">Le {document.date || '01 Octobre 2026'}</p>
              <p className="text-xs font-bold text-slate-900 uppercase">Le Directeur des Affaires Académiques</p>
              
              {/* Sceau graphique */}
              <div className="inline-block relative my-2">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-700/60 flex items-center justify-center rotate-12 text-emerald-800 text-[9px] font-black uppercase text-center p-2">
                  SCEAU OFFICIEL CAMPUSLITE<br />DIRECTION DES ÉTUDES
                </div>
              </div>

              <p className="text-xs font-serif italic text-slate-700">Direction Générale des Études</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
