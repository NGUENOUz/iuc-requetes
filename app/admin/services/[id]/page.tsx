'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ChevronRight, Mail, Phone, Calendar,
  Building2, Users, Clock, ShieldCheck, Zap,
  Plus, Edit3, Settings, UserCog, UserCheck,
  TrendingUp, BarChart3, Shield, Star, Eye,
  ChevronDown, Search, Filter, AlertTriangle, AlertCircle
} from 'lucide-react';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const DEPARTEMENT = {
  id: 'DEP-SCOL',
  nom: 'Scolarité',
  code: 'SCOL',
  chef: 'NKEMENI Paul',
  chefEmail: 'p.nkemeni@iuc.cm',
  chefTel: '+237 655 300 400',
  description: 'Gestion des inscriptions, des attestations de scolarité, des réclamations de notes et des dossiers académiques de l\'établissement.',
  dateCreation: '15 janvier 2018',
  status: 'Actif',
  routingMode: 'Par charge de travail (intelligent)',
  slaWarning: '24 heures',
  slaLimit: '48 heures',
};

const STATS = [
  { label: 'Agents affectés', value: 4, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
  { label: 'Requêtes en cours', value: 18, icon: Clock, color: 'text-amber-600 bg-amber-50' },
  { label: 'SLA respecté', value: '94%', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Tps de réponse moyen', value: '1.5j', icon: Zap, color: 'text-blue-600 bg-blue-50' },
];

const AGENTS = [
  { id: 'PER-001', nom: 'TAMBA Eric', email: 'e.tamba@iuc.cm', role: 'Agent', statut: 'Disponible', requetesAssignees: 12, requetesResolues: 184, satisfaction: '96%', avatar: 'TE' },
  { id: 'PER-002', nom: 'FOUDA Martine', email: 'm.fouda@iuc.cm', role: 'Agent', statut: 'Disponible', requetesAssignees: 8, requetesResolues: 120, satisfaction: '100%', avatar: 'FM' },
  { id: 'PER-003', nom: 'NKEMENI Paul', email: 'p.nkemeni@iuc.cm', role: 'Superviseur', statut: 'Disponible', requetesAssignees: 3, requetesResolues: 45, satisfaction: '94%', avatar: 'NP' },
  { id: 'PER-009', nom: 'MOUKAM Thierry', email: 't.moukam@iuc.cm', role: 'Agent', statut: 'Disponible', requetesAssignees: 10, requetesResolues: 90, satisfaction: '90%', avatar: 'MT' },
];

const REQUETES_COURANTES = [
  { id: 'REQ-1248', etudiant: 'NGUENOU Wilfried', categorie: 'Réclamation de note', priorite: 'Haute', date: '19 mai 2025', statut: 'En cours', agent: 'TAMBA Eric' },
  { id: 'REQ-1255', etudiant: 'KAMGA Aurelie', categorie: "Demande d'attestation", priorite: 'Basse', date: '20 mai 2025', statut: 'En cours', agent: 'TAMBA Eric' },
  { id: 'REQ-1260', etudiant: 'TCHOUTA Marc', categorie: 'Correction de relevé', priorite: 'Moyenne', date: '21 mai 2025', statut: 'En attente', agent: 'Aucun' },
  { id: 'REQ-1262', etudiant: 'BIFOUNA Raïssa', categorie: 'Changement de groupe', priorite: 'Haute', date: '22 mai 2025', statut: 'En cours', agent: 'FOUDA Martine' },
  { id: 'REQ-1270', etudiant: 'FOFANA Youssef', categorie: 'Demande d\'attestation', priorite: 'Basse', date: '22 mai 2025', statut: 'En cours', agent: 'MOUKAM Thierry' },
];

const CATEGORIES = [
  { nom: 'Réclamation de note', delaiSla: '48h', prioriteDefaut: 'Haute', active: true },
  { nom: 'Demande d\'attestation de scolarité', delaiSla: '24h', prioriteDefaut: 'Basse', active: true },
  { nom: 'Correction de relevé de notes', delaiSla: '48h', prioriteDefaut: 'Moyenne', active: true },
  { nom: 'Changement de groupe de TD', delaiSla: '72h', prioriteDefaut: 'Moyenne', active: true },
  { nom: 'Demande de transfert de filière', delaiSla: '72h', prioriteDefaut: 'Haute', active: true },
];

const REPARTITION_PERF = [
  { name: 'Attestations', value: 45, color: 'bg-emerald-500' },
  { name: 'Réclamations de note', value: 35, color: 'bg-indigo-500' },
  { name: 'Correction de relevés', value: 12, color: 'bg-amber-500' },
  { name: 'Changements de groupe', value: 8, color: 'bg-red-400' },
];

/* ═══════════════════════ STYLES ═══════════════════════ */

const availabilityDot: Record<string, string> = {
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

const AVATAR_COLORS = [
  'from-indigo-400 to-indigo-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-amber-400 to-amber-600',
];

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'agents' | 'requetes' | 'categories' | 'parametres'>('agents');
  const [statusLocal, setStatusLocal] = useState(DEPARTEMENT.status);
  const [routingLocal, setRoutingLocal] = useState(DEPARTEMENT.routingMode);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px]">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/services"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all shadow-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">{DEPARTEMENT.nom}</h1>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">{DEPARTEMENT.id}</p>
          </div>
        </div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Link href="/admin" className="hover:text-emerald-600 transition-colors">Tableau de bord</Link>
          <ChevronRight size={12} />
          <Link href="/admin/services" className="hover:text-emerald-600 transition-colors">Services</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-semibold">{DEPARTEMENT.nom}</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20">
          <Edit3 size={14} /> Modifier le service
        </button>
        
        {/* Statut service */}
        <select
          value={statusLocal}
          onChange={e => setStatusLocal(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm cursor-pointer"
        >
          <option value="Actif">Statut: Actif 🟢</option>
          <option value="Inactif">Statut: Temporaire Inactif 🔴</option>
        </select>

        <a href={`mailto:${DEPARTEMENT.chefEmail}`}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm">
          <Mail size={14} /> Contacter le responsable
        </a>

        <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm ml-auto">
          <Plus size={14} /> Affecter un agent
        </button>
      </div>

      {/* ── Contenu principal ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Colonne gauche (Infos de base) ── */}
        <div className="space-y-4">

          {/* Fiche département */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Building2 size={22} />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-base">{DEPARTEMENT.nom}</h2>
                <p className="text-xs text-slate-400">Code interne : {DEPARTEMENT.code}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
              {DEPARTEMENT.description}
            </p>

            <div className="border-t border-slate-50 pt-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Date de création</span>
                <span className="font-bold text-slate-700">{DEPARTEMENT.dateCreation}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Statut global</span>
                <span className={`font-bold px-2 py-0.5 rounded-lg text-[10px] ${
                  statusLocal === 'Actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>{statusLocal}</span>
              </div>
            </div>
          </div>

          {/* Fiche du responsable */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Responsable du service</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center shrink-0">
                NP
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">{DEPARTEMENT.chef}</p>
                <p className="text-xs text-slate-500">Superviseur de Service</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <a href={`mailto:${DEPARTEMENT.chefEmail}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-emerald-600 transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                  <Mail size={13} className="text-slate-400 group-hover:text-emerald-600" />
                </div>
                <span className="truncate">{DEPARTEMENT.chefEmail}</span>
              </a>
              <a href={`tel:${DEPARTEMENT.chefTel}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-emerald-600 transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                  <Phone size={13} className="text-slate-400 group-hover:text-emerald-600" />
                </div>
                <span>{DEPARTEMENT.chefTel}</span>
              </a>
            </div>
          </div>

          {/* Distribution des requêtes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Répartition par catégorie</h3>
            <p className="text-xs text-slate-400 mb-4 font-medium">Répartition globale des demandes reçues par ce service.</p>
            <div className="space-y-3.5">
              {REPARTITION_PERF.map(r => (
                <div key={r.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{r.name}</span>
                    <span>{r.value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Colonne droite (2/3) ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Stats top */}
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

          {/* Onglets */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Navigation des onglets */}
            <div className="flex border-b border-slate-100 overflow-x-auto">
              {[
                { key: 'agents', label: 'Agents affectés', count: AGENTS.length },
                { key: 'requetes', label: 'Dossiers courants', count: REQUETES_COURANTES.length },
                { key: 'categories', label: 'Catégories & Délais SLA', count: CATEGORIES.length },
                { key: 'parametres', label: 'Règles d\'attribution' },
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

            {/* ── Onglet Agents ── */}
            {activeTab === 'agents' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Agent', 'Rôle', 'Statut', 'Dossiers actifs', 'Traités', 'Satisfaction', ''].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {AGENTS.map((a, idx) => (
                      <tr key={a.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white text-[10px] font-black flex items-center justify-center`}>
                                {a.avatar}
                              </div>
                              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${availabilityDot[a.statut]}`} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{a.nom}</p>
                              <p className="text-[9px] text-slate-400 font-mono">{a.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${roleStyle[a.role]}`}>
                            {a.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-semibold text-slate-600">{a.statut}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-black ${a.requetesAssignees > 10 ? 'text-red-500' : 'text-slate-800'}`}>
                            {a.requetesAssignees}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">{a.requetesResolues}</td>
                        <td className="py-3 px-4 text-xs font-bold text-emerald-600">{a.satisfaction}</td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/admin/personnel/${a.id}`}
                            className="inline-flex w-7 h-7 rounded-lg hover:bg-slate-100 items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                            <Eye size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Onglet Requêtes Courantes ── */}
            {activeTab === 'requetes' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['ID', 'Étudiant', 'Catégorie', 'Priorité', 'Date', 'Assigné à', ''].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {REQUETES_COURANTES.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">#{r.id}</td>
                        <td className="py-3 px-4 text-xs font-bold text-slate-800">{r.etudiant}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 font-medium">{r.categorie}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${prioriteStyle[r.priorite]}`}>{r.priorite}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">{r.date}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 font-bold">{r.agent}</td>
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

            {/* ── Onglet Catégories & Délais ── */}
            {activeTab === 'categories' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Catégorie', 'Délai SLA limite', 'Priorité par défaut', 'Statut de routage', 'Actions'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {CATEGORIES.map(c => (
                      <tr key={c.nom} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-xs font-bold text-slate-800">{c.nom}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg">{c.delaiSla}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${prioriteStyle[c.prioriteDefaut]}`}>
                            {c.prioriteDefaut}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Routage Actif
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline">
                            Configurer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Onglet Paramètres de routage ── */}
            {activeTab === 'parametres' && (
              <div className="p-5 space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1.5">Algorithme d&apos;attribution automatique</h4>
                  <p className="text-xs text-slate-500 mb-3">Choisissez la logique appliquée pour assigner les dossiers entrants aux différents agents de la Scolarité.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { title: 'Attribution intelligente (Recommandé)', desc: 'Attribue à l\'agent disponible ayant la charge de travail la plus faible.', mode: 'Par charge de travail (intelligent)' },
                      { title: 'Distribution séquentielle (Round Robin)', desc: 'Distribue équitablement les requêtes l\'une après l\'autre.', mode: 'Tour de rôle (Round Robin)' },
                    ].map(opt => (
                      <button
                        key={opt.title}
                        onClick={() => setRoutingLocal(opt.mode)}
                        className={`text-left p-4 rounded-2xl border transition-all ${
                          routingLocal === opt.mode
                            ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-800">{opt.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Seuils et alertes SLA</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Alerte de retard (Warning)</label>
                      <input
                        type="text"
                        value={DEPARTEMENT.slaWarning}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Délai critique (Escalade)</label>
                      <input
                        type="text"
                        value={DEPARTEMENT.slaLimit}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertTriangle size={15} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-amber-900">Notification en cas d&apos;escalade</h5>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Si une requête du service Scolarité n&apos;est pas résolue dans les 48 heures, le superviseur <strong>NKEMENI Paul</strong> recevra une notification automatique par email avec copie à l&apos;administration générale.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Widget IA */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-indigo-200" />
                  <h3 className="font-bold text-sm">Rapport de charge IA</h3>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed mb-3">
                  Le département Scolarité enregistre une augmentation de <strong>14% des demandes d&apos;attestations</strong> ce mois-ci. 
                  Grâce à l&apos;attribution intelligente, la charge de travail est uniformément répartie. L&apos;embauche ou l&apos;affectation temporaire d&apos;un agent supplémentaire n&apos;est pas requise actuellement.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-white/20 rounded-lg px-2.5 py-1 text-xs font-bold">Santé du service: Excellente ✓</div>
                  <div className="bg-white/20 rounded-lg px-2.5 py-1 text-xs font-bold">Attribution: Équilibrée ⚖</div>
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
