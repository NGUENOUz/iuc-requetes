'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText, Plus, Clock, CheckCircle, ArrowRight,
  Zap, Calendar, FileCheck, ExternalLink, Printer,
  ShieldCheck, Activity, Search
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { useStudent, useStudentRequests } from '@/lib/hooks';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';

export default function DashboardPage() {
  const { student, loading: studentLoading } = useStudent();
  const { requests, stats, loading: requestsLoading } = useStudentRequests(student?.id);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const roleCode = student?.role_code || 'etudiant';
  const roleTitle =
    roleCode === 'enseignant'
      ? 'Espace Enseignant & Chercheur'
      : roleCode === 'personnel'
      ? 'Espace Personnel Administratif'
      : 'Espace Étudiant';

  const roleSubtitle =
    roleCode === 'enseignant'
      ? `${student?.fonction || 'Corps Professoral'} • IUC Logbessou`
      : roleCode === 'personnel'
      ? `${student?.fonction || 'Administration'} • IUC Logbessou`
      : `${student?.filiere || 'Génie Logiciel'} (${student?.niveau || 'L3'}) • Année ${student?.annee_academique || '2025-2026'}`;

  const recentRequests = requests.slice(0, 6);

  return (
    <StudentLayout>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* ═══════════════════════════════════════════════════════════════
            HERO EXECUTIVE BANNER (Black & White Minimalism)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-[#09090b] text-white rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {roleTitle}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400 font-mono">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Bonjour, {student?.first_name || 'Bienvenue'} {student?.last_name || ''}
              </h1>
              <p className="text-zinc-400 text-sm mt-1 max-w-xl">
                {roleSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/nouvelle-requete"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs tracking-tight transition-all shadow-sm"
              >
                <Plus size={15} />
                Nouvelle demande
              </Link>
              <Link
                href="/documents"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold text-xs tracking-tight transition-all"
              >
                <FileCheck size={14} />
                Mes documents certifiés
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            KPI METRICS (Black & White Precision)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Demandes</span>
              <FileText size={16} className="text-zinc-400" />
            </div>
            <p className="text-3xl font-extrabold text-zinc-950 font-mono tracking-tight">
              {stats.total}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Historique complet enregistré
            </p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Résolues & Certifiées</span>
              <CheckCircle size={16} className="text-zinc-950" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-zinc-950 font-mono tracking-tight">
                {stats.resolved}
              </p>
              <span className="text-[11px] font-mono text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                {stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '100%'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Documents et réponses délivrés
            </p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">En Instruction</span>
              <Clock size={16} className="text-zinc-500" />
            </div>
            <p className="text-3xl font-extrabold text-zinc-950 font-mono tracking-tight">
              {stats.in_progress}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Traitement actif par les services
            </p>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs hover:border-zinc-300 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">En Attente</span>
              <Activity size={16} className="text-zinc-400" />
            </div>
            <p className="text-3xl font-extrabold text-zinc-950 font-mono tracking-tight">
              {stats.pending}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Routage & affectation intelligente
            </p>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════
            MAIN 2-COLUMN SECTION
            ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne gauche (2/3) : Demandes récentes */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-950 tracking-tight">
                  Demandes récentes
                </h2>
                <p className="text-xs text-zinc-500">
                  Consultez vos tickets récents et accédez aux documents certifiés
                </p>
              </div>

              <Link
                href="/mes-requetes"
                className="text-xs font-bold text-black hover:text-zinc-600 inline-flex items-center gap-1 transition-colors"
              >
                Voir tout ({requests.length})
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100 shadow-2xs">
              {recentRequests.length === 0 ? (
                <div className="p-12 text-center text-zinc-400 space-y-2">
                  <FileText size={32} className="mx-auto text-zinc-300" />
                  <p className="text-sm font-semibold text-zinc-700">Aucune demande enregistrée</p>
                  <p className="text-xs text-zinc-400">
                    Créez votre première requête pour suivre son traitement en temps réel.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/nouvelle-requete"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <Plus size={14} /> Créer une requête
                    </Link>
                  </div>
                </div>
              ) : (
                recentRequests.map((req) => {
                  const isResolved = req.status?.name === 'Résolue';
                  const hasCert = (req as any).metadata?.document_code;

                  return (
                    <div
                      key={req.id}
                      className="p-4 hover:bg-zinc-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-[11px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                            {req.reference}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            isResolved
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                          }`}>
                            {req.status?.name || 'En cours'}
                          </span>
                          {hasCert && (
                            <span className="text-[10px] font-mono font-bold text-zinc-800 bg-zinc-100 border border-zinc-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Zap size={10} />
                              Certifié
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/mes-requetes/${req.id}`}
                          className="text-sm font-bold text-zinc-900 hover:text-black line-clamp-1 transition-colors"
                        >
                          {req.title}
                        </Link>

                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
                          <span>{req.category?.name || 'Catégorie'}</span>
                          <span>•</span>
                          <span>
                            {new Date(req.submitted_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasCert && (
                          <button
                            type="button"
                            onClick={() => setSelectedDoc(req)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 rounded-lg text-xs font-bold transition-colors"
                            title="Consulter le document certifié"
                          >
                            <Printer size={13} />
                            Document
                          </button>
                        )}
                        <Link
                          href={`/mes-requetes/${req.id}`}
                          className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Détails
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Colonne droite (1/3) : Accès rapide & Contrôle de service */}
          <div className="space-y-6">
            
            {/* Boîte d'action rapide */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                Délivrance Express
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Les attestations officielles et réclamations standardisées sont générées avec scellement numérique immédiat.
              </p>

              <div className="space-y-2">
                <Link
                  href="/nouvelle-requete"
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-200 hover:border-black hover:bg-zinc-50 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-black text-white flex items-center justify-center font-bold text-xs">
                      ⚡
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-xs font-bold text-zinc-900">
                        {roleCode === 'enseignant'
                          ? 'Attestation de travail & vacation'
                          : roleCode === 'personnel'
                          ? 'Attestation de prise de service'
                          : 'Attestation de scolarité officielle'}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">Signature numérique &lt; 3s</p>
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/nouvelle-requete"
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-200 hover:border-black hover:bg-zinc-50 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center font-bold text-xs">
                      📝
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-xs font-bold text-zinc-900">
                        {roleCode === 'enseignant'
                          ? 'Matériel & Réservation amphi'
                          : roleCode === 'personnel'
                          ? 'Fournitures de bureau & reprographie'
                          : 'Réclamation de note & examen'}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono">Aiguillage automatique SLA</p>
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-zinc-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </div>

            {/* Normes de vérification */}
            <div className="bg-[#09090b] text-white rounded-xl p-5 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-white" />
                <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-zinc-200">
                  Sécurité & Authenticité QR
                </h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tout document émis par la plateforme dispose d'un identifiant cryptographique unique consultable par les autorités universitaires et les consulats.
              </p>
              <div className="pt-1">
                <Link
                  href="/documents"
                  className="text-xs font-bold text-white hover:text-zinc-300 inline-flex items-center gap-1.5 transition-colors"
                >
                  Accéder au coffre numérique
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modal du document officiel certifié */}
      {selectedDoc && (
        <OfficialDocumentModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={{
            type: 'attestation',
            title: selectedDoc.title,
            code: selectedDoc.metadata?.document_code || 'CERT-IUC-2026',
            date: new Date(selectedDoc.resolved_at || selectedDoc.submitted_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            requesterName: `${student?.first_name} ${student?.last_name}`,
            matricule: student?.matricule || 'N/A',
            programOrFunction:
              roleCode === 'enseignant'
                ? (student?.fonction || 'Enseignant - IUC')
                : roleCode === 'personnel'
                ? (student?.fonction || 'Personnel Administratif')
                : `${student?.filiere || 'Génie Logiciel'} (${student?.niveau || 'L3'})`,
            academicYear: student?.annee_academique || '2025-2026',
          }}
        />
      )}
    </StudentLayout>
  );
}
