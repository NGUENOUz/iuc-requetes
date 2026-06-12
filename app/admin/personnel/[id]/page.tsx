'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ChevronRight, Mail, Phone, MapPin, Calendar,
  UserCog, Shield, Star, Zap, CheckCircle, Clock, XCircle,
  RefreshCw, Edit3, UserX, UserCheck, Download, Eye,
  MessageSquare, Send, TrendingUp, Award, BarChart3,
  Briefcase, Activity, AlertCircle, Sparkles, Ban,
  CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const DEPUTY = {
  id: 'PER-001',
  nom: 'TAMBA Eric',
  matricule: 'AGT-2019-041',
  email: 'e.tamba@iuc.cm',
  telephone: '+237 691 100 200',
  role: 'Agent',
  departement: 'Scolarité',
  statut: 'Disponible',
  requetesAssignees: 12,
  avatar: 'TE',
  specialites: ['Attestations de scolarité', 'Réclamations de note', 'Relevés de notes', 'Transferts'],
  dateEntree: '12 janvier 2019',
  adresse: 'Logbessou, Douala, Cameroun',
  sexe: 'Masculin',
  dernierAcces: 'Il y a 10 minutes',
  rating: 4.8,
  totalAvis: 124,
  satisfaction: '96%',
};

const STATS = [
  { label: 'Requêtes en cours', value: 12, icon: Clock, color: 'text-amber-600 bg-amber-50' },
  { label: 'Requêtes résolues', value: 184, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Taux de résolution', value: '92%', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
  { label: 'Temps moyen', value: '1.8 jours', icon: Zap, color: 'text-violet-600 bg-violet-50' },
];

const REQUETES_ACTIVES = [
  { id: 'REQ-1248', etudiant: 'NGUENOU Wilfried', categorie: 'Réclamation de note', priorite: 'Haute', date: '19 mai 2025', statut: 'En cours' },
  { id: 'REQ-1255', etudiant: 'KAMGA Aurelie', categorie: "Demande d'attestation", priorite: 'Basse', date: '20 mai 2025', statut: 'En cours' },
  { id: 'REQ-1260', etudiant: 'TCHOUTA Marc', categorie: 'Correction de relevé', priorite: 'Moyenne', date: '21 mai 2025', statut: 'En attente' },
  { id: 'REQ-1262', etudiant: 'BIFOUNA Raïssa', categorie: 'Changement de groupe', priorite: 'Haute', date: '22 mai 2025', statut: 'En cours' },
];

const REQUETES_HISTORIQUE = [
  { id: 'REQ-1201', etudiant: 'KENGNE Boris', categorie: "Demande d'attestation", priorite: 'Basse', dateResolution: '18 mai 2025', statut: 'Résolue' },
  { id: 'REQ-1145', etudiant: 'EPOTE Samuel', categorie: 'Changement de groupe', priorite: 'Moyenne', dateResolution: '15 mai 2025', statut: 'Résolue' },
  { id: 'REQ-1089', etudiant: 'DJOMO Grace', categorie: 'Problème de paiement', priorite: 'Haute', dateResolution: '10 mai 2025', statut: 'Résolue' },
  { id: 'REQ-0987', etudiant: 'TADJOU Paul', categorie: 'Certificat de scolarité', priorite: 'Basse', dateResolution: '05 mai 2025', statut: 'Résolue' },
  { id: 'REQ-0950', etudiant: 'NJEUMEN Nina', categorie: 'Réclamation de note', priorite: 'Haute', dateResolution: '02 mai 2025', statut: 'Rejetée' },
];

const ACTIVITES = [
  { date: 'Il y a 10 min', action: 'Requête assignée', detail: 'REQ-1262 assignée par Superviseur Paul', color: 'bg-blue-100 text-blue-600', icon: Clock },
  { date: 'Il y a 2 heures', action: 'Requête résolue', detail: 'REQ-1201 marquée comme résolue', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle },
  { date: 'Hier, 16:30', action: 'Commentaire interne', detail: 'A posté un commentaire sur REQ-1248', color: 'bg-purple-100 text-purple-600', icon: MessageSquare },
  { date: '20 mai 2025', action: 'Statut mis à jour', detail: "Passage du statut d'absence à 'Disponible'", color: 'bg-slate-100 text-slate-600', icon: UserCheck },
  { date: '19 mai 2025', action: 'Requête transférée', detail: 'REQ-1130 transférée à Scolarité', color: 'bg-amber-100 text-amber-600', icon: RefreshCw },
];

const METRICS_PERF = [
  { month: 'Janvier', resolues: 32, satisfaction: 94 },
  { month: 'Février', resolues: 45, satisfaction: 95 },
  { month: 'Mars', resolues: 38, satisfaction: 93 },
  { month: 'Avril', resolues: 52, satisfaction: 97 },
  { month: 'Mai', resolues: 47, satisfaction: 96 },
];

/* ═══════════════════════ STYLES ═══════════════════════ */

const statutStyle: Record<string, string> = {
  'Disponible': 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  'Occupé':     'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  'En congé':   'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
};

const statutDot: Record<string, string> = {
  'Disponible': 'bg-emerald-500',
  'Occupé':     'bg-yellow-500',
  'En congé':   'bg-blue-400',
};

const prioriteStyle: Record<string, string> = {
  'Haute':   'bg-red-50 text-red-600',
  'Moyenne': 'bg-yellow-50 text-yellow-700',
  'Basse':   'bg-slate-100 text-slate-500',
};

const roleStyle: Record<string, string> = {
  'Agent':          'bg-slate-100 text-slate-700',
  'Superviseur':    'bg-violet-100 text-violet-700',
  'Administrateur': 'bg-amber-100 text-amber-700',
};

const roleIcon: Record<string, React.ReactNode> = {
  'Agent':          <UserCog size={11} />,
  'Superviseur':    <Shield size={11} />,
  'Administrateur': <Star size={11} />,
};

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminPersonnelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'actives' | 'historique' | 'performances' | 'activite'>('actives');
  const [statutLocal, setStatutLocal] = useState(DEPUTY.statut);
  const [roleLocal, setRoleLocal] = useState(DEPUTY.role);
  const [note, setNote] = useState('');

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px]">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/personnel"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all shadow-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">{DEPUTY.nom}</h1>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">{DEPUTY.matricule}</p>
          </div>
        </div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Link href="/admin" className="hover:text-emerald-600 transition-colors">Tableau de bord</Link>
          <ChevronRight size={12} />
          <Link href="/admin/personnel" className="hover:text-emerald-600 transition-colors">Personnel</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-semibold">{DEPUTY.nom}</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20">
          <Edit3 size={14} /> Modifier le compte
        </button>
        
        {/* Toggle Disponibilité */}
        <select
          value={statutLocal}
          onChange={e => setStatutLocal(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm cursor-pointer"
        >
          <option value="Disponible">Disponible 🟢</option>
          <option value="Occupé">Occupé 🟡</option>
          <option value="En congé">En congé 🔵</option>
        </select>

        {/* Changer de rôle */}
        <select
          value={roleLocal}
          onChange={e => setRoleLocal(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm cursor-pointer"
        >
          <option value="Agent">Rôle: Agent</option>
          <option value="Superviseur">Rôle: Superviseur</option>
          <option value="Administrateur">Rôle: Administrateur</option>
        </select>

        <a href={`mailto:${DEPUTY.email}`}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm">
          <Mail size={14} /> Envoyer un email
        </a>

        {/* Bouton de réattribution des dossiers */}
        {DEPUTY.requetesAssignees > 0 && (
          <button className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2.5 rounded-xl border border-red-200 transition-colors shadow-sm">
            <RefreshCw size={14} className="animate-spin-slow" /> Réassigner ses dossiers
          </button>
        )}
      </div>

      {/* ── Contenu principal ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Colonne gauche ── */}
        <div className="space-y-4">

          {/* Carte profil */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Bannière */}
            <div className="h-20 bg-gradient-to-r from-emerald-700 to-teal-600 relative">
              <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Accès: {DEPUTY.dernierAcces}
              </span>
            </div>
            {/* Avatar */}
            <div className="px-5 pb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-xl font-black flex items-center justify-center -mt-8 mb-3 border-4 border-white shadow-md">
                {DEPUTY.avatar}
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-black text-slate-900 text-base">{DEPUTY.nom}</h2>
                  <p className="text-xs text-slate-500">{DEPUTY.departement} · IUC Staff</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 mt-1">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${statutStyle[statutLocal]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statutDot[statutLocal]}`} />
                    {statutLocal}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${roleStyle[roleLocal]}`}>
                    {roleIcon[roleLocal]} {roleLocal}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Détails du compte</h3>
            <div className="space-y-3">
              {[
                { icon: Mail, label: DEPUTY.email, href: `mailto:${DEPUTY.email}`, color: 'bg-blue-50 text-blue-500' },
                { icon: Phone, label: DEPUTY.telephone, href: `tel:${DEPUTY.telephone}`, color: 'bg-emerald-50 text-emerald-500' },
                { icon: MapPin, label: DEPUTY.adresse, color: 'bg-slate-100 text-slate-500' },
                { icon: Calendar, label: `Recruté(e) le ${DEPUTY.dateEntree}`, color: 'bg-violet-50 text-violet-500' },
                { icon: Briefcase, label: `Sexe: ${DEPUTY.sexe}`, color: 'bg-amber-50 text-amber-600' },
              ].map(({ icon: Icon, label, href, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={13} />
                  </div>
                  {href ? (
                    <a href={href} className="text-xs text-slate-600 hover:text-emerald-600 transition-colors truncate">{label}</a>
                  ) : (
                    <span className="text-xs text-slate-600 truncate">{label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Spécialités / Compétences */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">Spécialités de traitement</h3>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Automatique</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Ces catégories de requêtes lui sont attribuées en priorité par l&apos;algorithme de routage.</p>
            <div className="flex flex-wrap gap-1.5">
              {DEPUTY.specialites.map(s => (
                <span key={s} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Évaluation / Satisfaction */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Retours étudiants</h3>
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center shrink-0">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                  <Star size={16} fill="currentColor" />
                  <span className="text-lg font-black text-slate-950">{DEPUTY.rating}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Sur 5 étoiles</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-800">{DEPUTY.satisfaction}</span>
                  <span className="text-xs text-slate-400 font-medium">d&apos;avis positifs</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Calculé sur {DEPUTY.totalAvis} évaluations anonymes après résolution.</p>
              </div>
            </div>
          </div>

          {/* Note interne admin */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <MessageSquare size={13} className="text-violet-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Notes d&apos;évaluation</h3>
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ajouter un commentaire d'évaluation ou note administrative confidentielle..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 transition-all resize-none"
            />
            <button
              disabled={!note.trim()}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-xl transition-colors shadow-sm"
            >
              <Send size={12} /> Enregistrer la note
            </button>
          </div>
        </div>

        {/* ── Colonne droite (2/3) ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Stats de performance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                  <Icon size={17} />
                </div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Onglets principaux */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-100 overflow-x-auto">
              {[
                { key: 'actives', label: 'Requêtes en cours', count: REQUETES_ACTIVES.length },
                { key: 'historique', label: 'Historique traité', count: REQUETES_HISTORIQUE.length },
                { key: 'performances', label: 'Indicateurs de performance' },
                { key: 'activite', label: "Journal d'activité", count: ACTIVITES.length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 -mb-px shrink-0 ${
                    activeTab === key
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {label}
                  {count !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Onglet Requêtes en cours ── */}
            {activeTab === 'actives' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['ID', 'Étudiant', 'Catégorie', 'Priorité', 'Date assignation', 'Statut', ''].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {REQUETES_ACTIVES.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">#{r.id}</td>
                        <td className="py-3 px-4 text-xs font-bold text-slate-800">{r.etudiant}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 font-medium">{r.categorie}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${prioriteStyle[r.priorite]}`}>{r.priorite}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">{r.date}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-yellow-100 text-yellow-700">
                            <RefreshCw size={10} className="animate-spin-slow" /> {r.statut}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/admin/requetes/${r.id}`}
                            className="inline-flex w-7 h-7 rounded-lg hover:bg-emerald-50 items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100">
                            <Eye size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Onglet Historique traité ── */}
            {activeTab === 'historique' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['ID', 'Étudiant', 'Catégorie', 'Priorité', 'Date résolution', 'Statut', ''].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {REQUETES_HISTORIQUE.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">#{r.id}</td>
                        <td className="py-3 px-4 text-xs font-bold text-slate-800">{r.etudiant}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 font-medium">{r.categorie}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${prioriteStyle[r.priorite]}`}>{r.priorite}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">{r.dateResolution}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                            r.statut === 'Résolue' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {r.statut === 'Résolue' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                            {r.statut}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/admin/requetes/${r.id}`}
                            className="inline-flex w-7 h-7 rounded-lg hover:bg-emerald-50 items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100">
                            <Eye size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Onglet Performances ── */}
            {activeTab === 'performances' && (
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider">Volume de requêtes par mois</h4>
                    <div className="space-y-3">
                      {METRICS_PERF.map(m => (
                        <div key={m.month} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-600">
                            <span>{m.month}</span>
                            <span>{m.resolues} résolues</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(m.resolues / 60) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider">Taux de satisfaction mensuel</h4>
                    <div className="space-y-3">
                      {METRICS_PERF.map(m => (
                        <div key={m.month} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-600">
                            <span>{m.month}</span>
                            <span className="text-emerald-600">{m.satisfaction}% satisf.</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.satisfaction}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Activity size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800">Commentaire de performance globale</h4>
                    <p className="text-xs text-emerald-700/90 leading-relaxed mt-1">
                      Eric maintient un taux de traitement supérieur à la moyenne du service Scolarité (92% vs 84%). Son taux de satisfaction est constant et excellent. Sa spécialisation sur les demandes de relevés de notes accélère considérablement le temps de réponse global du département.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Onglet Activités ── */}
            {activeTab === 'activite' && (
              <div className="p-5">
                <div className="space-y-0">
                  {ACTIVITES.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <div key={i} className="flex gap-3 relative">
                        {i < ACTIVITES.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-100" />
                        )}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 ${a.color}`}>
                          <Icon size={13} />
                        </div>
                        <div className="flex-1 pb-5">
                          <p className="text-sm font-semibold text-slate-800">{a.action}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{a.detail}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{a.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Widget IA */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-indigo-200" />
                  <h3 className="font-bold text-sm">Analyse IA — Charge de travail</h3>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed mb-3">
                  TAMBA Eric gère actuellement <strong>12 requêtes actives</strong>, ce qui représente une charge de travail <strong>optimale</strong> pour son profil. 
                  Son temps moyen de résolution (1.8j) est excellent. 
                  Aucun retard critique n&apos;est signalé sur ses dossiers en cours.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-white/20 rounded-lg px-2.5 py-1 text-xs font-bold">Charge: Normale (82%)</div>
                  <div className="bg-white/20 rounded-lg px-2.5 py-1 text-xs font-bold">Rapidité: Top 10% ⚡</div>
                </div>
              </div>
              <div className="bg-white/20 rounded-2xl p-3 shrink-0">
                <TrendingUp size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
