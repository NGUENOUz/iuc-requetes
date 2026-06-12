'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileBarChart, FileText, Download, Calendar, Settings, Play,
  Trash2, CheckCircle2, Clock, Mail, Plus, Sparkles,
  Filter, Building2, User, RefreshCw, AlertCircle
} from 'lucide-react';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const REPORT_TYPES = [
  { id: 'rep-global', nom: 'Rapport d\'activité global', desc: 'Synthèse des volumes de requêtes, résolutions et taux de satisfaction sur l\'ensemble de l\'établissement.' },
  { id: 'rep-sla', nom: 'Rapport de performance & SLA', desc: 'Analyse détaillée des délais de réponse, des dépassements SLA et des goulots d\'étranglement.' },
  { id: 'rep-dep', nom: 'Rapport d\'analyse par département', desc: 'Comparatif des volumes traités, de la charge de travail et de l\'efficacité entre les différents services.' },
  { id: 'rep-feed', nom: 'Rapport d\'évaluation & satisfaction', desc: 'Compilation des retours d\'expérience étudiants, notes de satisfaction et commentaires anonymes.' },
];

const HISTORIQUE_RAPPORTS = [
  { id: 'REP-089', nom: 'Rapport_Activite_Global_Mai_2025.pdf', type: 'Activité globale', date: '01 juin 2025', format: 'PDF', taille: '2.4 Mo', auteur: 'ONDOA Claude', statut: 'Disponible' },
  { id: 'REP-088', nom: 'Rapport_SLA_Scolarite_Semaine_22.xlsx', type: 'Performance SLA', date: '29 mai 2025', format: 'Excel', taille: '1.2 Mo', auteur: 'NKEMENI Paul', statut: 'Disponible' },
  { id: 'REP-087', nom: 'Satisfaction_Etudiants_Q1_2025.pdf', type: 'Satisfaction', date: '15 mai 2025', format: 'PDF', taille: '4.8 Mo', auteur: 'ONDOA Claude', statut: 'Disponible' },
  { id: 'REP-086', nom: 'Rapport_Finances_Bourses_2024.xlsx', type: 'Départemental (Finance)', date: '30 avr. 2025', format: 'Excel', taille: '2.1 Mo', auteur: 'ETOGA Sylvie', statut: 'Disponible' },
  { id: 'REP-085', nom: 'Export_Brut_Requetes_2025_04.csv', type: 'Export brut', date: '01 mai 2025', format: 'CSV', taille: '8.5 Mo', auteur: 'Système', statut: 'Archivé' },
];

const RAPPORTS_PLANIFIES = [
  { id: 'PLAN-001', nom: 'Bilan hebdomadaire des requêtes Scolarité', type: 'Activité globale', frequence: 'Chaque lundi à 08:00', destinataire: 'Scolarité (Paul Nkemeni)', format: 'PDF', statut: 'Actif' },
  { id: 'PLAN-002', nom: 'Rapport mensuel de respect des SLA IUC', type: 'Performance SLA', frequence: 'Le 1er du mois à 07:00', destinataire: 'Direction Générale', format: 'PDF', statut: 'Actif' },
  { id: 'PLAN-003', nom: 'Export brut mensuel pour archivage comptable', type: 'Export brut (Finance)', frequence: 'Le 1er du mois à 00:00', destinataire: 'Comptabilité (Sylvie Etoga)', format: 'CSV', statut: 'Inactif' },
];

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminRapportsPage() {
  const [activeTab, setActiveTab] = useState<'generer' | 'historique' | 'planifier'>('generer');
  
  /* États pour le générateur de rapports */
  const [selectedType, setSelectedType] = useState('rep-global');
  const [dateRange, setDateRange] = useState('ce-mois');
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationSuccess(false);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationSuccess(true);
    }, 2500);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Rapports & Exports</h1>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">Pro</span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">Générez des synthèses d&apos;activité, suivez les KPI et planifiez des exports automatisés.</p>
        </div>
      </div>

      {/* ── Onglets principaux ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {[
            { key: 'generer', label: 'Générer un rapport', icon: FileBarChart },
            { key: 'historique', label: 'Historique des rapports', count: HISTORIQUE_RAPPORTS.length, icon: FileText },
            { key: 'planifier', label: 'Rapports planifiés', count: RAPPORTS_PLANIFIES.length, icon: Calendar },
          ].map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-all border-b-2 -mb-px shrink-0 ${
                activeTab === key
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} />
              {label}
              {count !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── 1. ONGLET GÉNÉRATION DE RAPPORT ── */}
        {activeTab === 'generer' && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Formulaire de configuration */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Type de rapport */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">1. Type de rapport</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {REPORT_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedType(t.id); setGenerationSuccess(false); }}
                      className={`text-left p-4 rounded-xl border transition-all flex gap-3 ${
                        selectedType === t.id
                          ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedType === t.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{t.nom}</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paramètres de filtrage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Période */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">2. Période temporelle</label>
                  <select
                    value={dateRange}
                    onChange={e => { setDateRange(e.target.value); setGenerationSuccess(false); }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 transition-all cursor-pointer"
                  >
                    <option value="aujourd-hui">Aujourd&apos;hui</option>
                    <option value="7-jours">7 derniers jours</option>
                    <option value="ce-mois">Ce mois-ci (Mai 2025)</option>
                    <option value="trimestre">Dernier trimestre (Q1 2025)</option>
                    <option value="personnalise">Période personnalisée...</option>
                  </select>
                </div>

                {/* Format de sortie */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">3. Format du fichier</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'pdf', label: 'PDF', sub: 'Document' },
                      { key: 'xlsx', label: 'Excel', sub: 'Tableur' },
                      { key: 'csv', label: 'CSV', sub: 'Export brut' }
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => { setFormat(f.key); setGenerationSuccess(false); }}
                        className={`p-2 rounded-xl border transition-all text-center ${
                          format === f.key
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs">{f.label}</p>
                        <p className="text-[9px] opacity-60 mt-0.5">{f.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bouton de génération */}
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-sm font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Génération du rapport en cours...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Générer le rapport ({format.toUpperCase()})
                    </>
                  )}
                </button>
              </div>

              {/* Notification succès de génération */}
              {generationSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex justify-between items-center animate-fade-in">
                  <div className="flex gap-2.5 items-start">
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-950">Rapport généré avec succès !</p>
                      <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">Votre fichier est prêt au téléchargement.</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                    <Download size={13} /> Télécharger
                  </button>
                </div>
              )}
            </div>

            {/* Volet suggestions de rapports de l&apos;IA (1/3 de large) */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-indigo-200" />
                  <h3 className="font-bold text-sm">Suggestions de rapports IA</h3>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                  Sur la base des dernières activités du système, l&apos;intelligence artificielle vous recommande de générer et d&apos;analyser les rapports suivants :
                </p>
                <div className="space-y-2.5">
                  {[
                    { title: 'SLA Breach Report (Finance)', desc: 'Le respect du SLA a chuté de 5% ce mois-ci dans le service Finance.' },
                    { title: 'Volume Peak Analysis (Notes)', desc: 'Un pic de réclamations de notes est attendu dans les 48h suite aux délibérations.' }
                  ].map(sug => (
                    <button
                      key={sug.title}
                      onClick={() => setGenerationSuccess(false)}
                      className="w-full text-left p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all text-white border border-white/5"
                    >
                      <p className="text-xs font-bold">{sug.title}</p>
                      <p className="text-[10px] text-indigo-200 mt-0.5 leading-normal">{sug.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicateur de volume d&apos;archivage */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Stockage des exports</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Capacité totale</span>
                  <span className="font-bold text-slate-700">1.2 Go / 10 Go</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }} />
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Les rapports générés manuellement sont conservés durant 30 jours avant d&apos;être automatiquement purgés.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. ONGLET HISTORIQUE DES RAPPORTS ── */}
        {activeTab === 'historique' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Nom du fichier', 'Type de rapport', 'Date de création', 'Format', 'Taille', 'Généré par', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {HISTORIQUE_RAPPORTS.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{r.nom}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 font-medium">{r.type}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{r.date}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        r.format === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>{r.format}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 font-medium">{r.taille}</td>
                    <td className="py-3 px-4 text-xs text-slate-700 font-bold">{r.auteur}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.statut === 'Disponible' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${r.statut === 'Disponible' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {r.statut}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors" title="Télécharger">
                          <Download size={13} />
                        </button>
                        <button className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title="Supprimer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── 3. ONGLET PLANIFICATION DE RAPPORTS ── */}
        {activeTab === 'planifier' && (
          <div className="p-5 space-y-4">
            
            {/* Header d&apos;onglet */}
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-slate-950 text-sm">Rapports programmés</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Générez et distribuez des synthèses périodiques par email à vos collaborateurs.</p>
              </div>
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm shadow-emerald-600/10">
                <Plus size={13} /> Programmer un rapport
              </button>
            </div>

            {/* Tableau des programmations */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl overflow-hidden mt-3">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Nom de la planification', 'Type de rapport', 'Fréquence d\'envoi', 'Destinataires', 'Format', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {RAPPORTS_PLANIFIES.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-800">{p.nom}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">{p.type}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 font-bold font-mono">{p.frequence}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Mail size={12} className="text-slate-400" />
                          <span>{p.destinataire}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">{p.format}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.statut === 'Actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${p.statut === 'Actif' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {p.statut}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline">
                            Désactiver
                          </button>
                          <button className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Note sur la messagerie */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start mt-2">
              <AlertCircle size={15} className="text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Les rapports programmés sont directement expédiés aux boîtes emails configurées ci-dessus sous forme de fichiers joints chiffrés. Assurez-vous que les permissions des destinataires sont à jour.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
