'use client';

import { useState } from 'react';
import {
  FileBarChart, FileText, Download, Calendar, Play,
  Trash2, CheckCircle2, Clock, Mail, Plus, Sparkles,
  RefreshCw, AlertCircle
} from 'lucide-react';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const REPORT_TYPES = [
  { id: 'rep-global', nom: 'Rapport d\'activité global', desc: 'Synthèse des volumes de requêtes, résolutions et taux de satisfaction sur l\'ensemble de l\'établissement.' },
  { id: 'rep-sla', nom: 'Rapport de performance & SLA', desc: 'Analyse détaillée des délais de réponse, des dépassements SLA et des goulots d\'étranglement.' },
  { id: 'rep-dep', nom: 'Rapport d\'analyse par département', desc: 'Comparatif des volumes traités, de la charge de travail et de l\'efficacité entre les différents services.' },
  { id: 'rep-feed', nom: 'Rapport d\'évaluation & satisfaction', desc: 'Compilation des retours d\'expérience étudiants, notes de satisfaction et commentaires anonymes.' },
];

const HISTORIQUE_RAPPORTS = [
  { id: 'REP-089', nom: 'Rapport_Activite_Global_Septembre_2026.pdf', type: 'Activité globale', date: '26 sept. 2026', format: 'PDF', taille: '2.4 Mo', auteur: 'ONDOA Claude', statut: 'Disponible' },
  { id: 'REP-088', nom: 'Rapport_SLA_Scolarite_Semaine_38.xlsx', type: 'Performance SLA', date: '22 sept. 2026', format: 'Excel', taille: '1.2 Mo', auteur: 'NKEMENI Paul', statut: 'Disponible' },
  { id: 'REP-087', nom: 'Satisfaction_Usagers_Q3_2026.pdf', type: 'Satisfaction', date: '15 sept. 2026', format: 'PDF', taille: '4.8 Mo', auteur: 'ONDOA Claude', statut: 'Disponible' },
  { id: 'REP-086', nom: 'Rapport_Finances_Bourses_2026.xlsx', type: 'Départemental (Finance)', date: '30 août 2026', format: 'Excel', taille: '2.1 Mo', auteur: 'ETOGA Sylvie', statut: 'Disponible' },
  { id: 'REP-085', nom: 'Export_Brut_Requetes_2026_08.csv', type: 'Export brut', date: '01 sept. 2026', format: 'CSV', taille: '8.5 Mo', auteur: 'Système', statut: 'Archivé' },
];

const RAPPORTS_PLANIFIES = [
  { id: 'PLAN-001', nom: 'Bilan hebdomadaire des requêtes Scolarité', type: 'Activité globale', frequence: 'Chaque lundi à 08:00', destinataire: 'Scolarité (Paul Nkemeni)', format: 'PDF', statut: 'Actif' },
  { id: 'PLAN-002', nom: 'Rapport mensuel de respect des SLA IUC', type: 'Performance SLA', frequence: 'Le 1er du mois à 07:00', destinataire: 'Direction Générale', format: 'PDF', statut: 'Actif' },
  { id: 'PLAN-003', nom: 'Export brut mensuel pour archivage comptable', type: 'Export brut (Finance)', frequence: 'Le 1er du mois à 00:00', destinataire: 'Comptabilité (Sylvie Etoga)', format: 'CSV', statut: 'Inactif' },
];

export default function AdminRapportsPage() {
  const [activeTab, setActiveTab] = useState<'generer' | 'historique' | 'planifier'>('generer');
  
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
    }, 1800);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e5e5] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#171717] tracking-tight">Rapports & Exports</h1>
            <span className="bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] text-xs font-mono font-medium px-2 py-0.5 rounded">Vercel Analytics Spec</span>
          </div>
          <p className="text-[#737373] text-sm mt-0.5">Synthèses exécutives, métriques SLA et planifications d&apos;exportation</p>
        </div>
      </div>

      {/* ── Onglets principaux ── */}
      <div className="bg-white rounded-md border border-[#e5e5e5] overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-[#e5e5e5] bg-[#fafafa] overflow-x-auto">
          {[
            { key: 'generer', label: 'Générer un rapport', icon: FileBarChart },
            { key: 'historique', label: 'Historique des rapports', count: HISTORIQUE_RAPPORTS.length, icon: FileText },
            { key: 'planifier', label: 'Rapports planifiés', count: RAPPORTS_PLANIFIES.length, icon: Calendar },
          ].map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors border-b-2 -mb-px shrink-0 ${
                activeTab === key
                  ? 'border-[#171717] text-[#171717] bg-white font-semibold'
                  : 'border-transparent text-[#737373] hover:text-[#171717]'
              }`}
            >
              <Icon size={14} />
              {label}
              {count !== undefined && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]">
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
                <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wide">1. Type de rapport</label>
                <div className="grid grid-cols-1 gap-2">
                  {REPORT_TYPES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedType(t.id); setGenerationSuccess(false); }}
                      className={`text-left p-3.5 rounded-md border transition-all flex gap-3 ${
                        selectedType === t.id
                          ? 'bg-[#f5f5f5] border-[#171717]'
                          : 'bg-white border-[#e5e5e5] hover:border-[#171717]/40'
                      }`}
                    >
                      <div className="w-7 h-7 rounded bg-[#171717] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={13} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#171717]">{t.nom}</p>
                        <p className="text-[11px] text-[#737373] mt-0.5 leading-relaxed">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paramètres de filtrage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Période */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wide">2. Période</label>
                  <select
                    value={dateRange}
                    onChange={e => { setDateRange(e.target.value); setGenerationSuccess(false); }}
                    className="w-full bg-white border border-[#e5e5e5] rounded-md px-3 py-2 text-xs font-medium text-[#171717] outline-none focus:border-[#171717] transition-colors"
                  >
                    <option value="aujourd-hui">Aujourd&apos;hui</option>
                    <option value="7-jours">7 derniers jours</option>
                    <option value="ce-mois">Ce mois-ci (Septembre 2026)</option>
                    <option value="trimestre">Dernier trimestre</option>
                    <option value="personnalise">Période personnalisée...</option>
                  </select>
                </div>

                {/* Format de sortie */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#171717] uppercase tracking-wide">3. Format d&apos;export</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'pdf', label: 'PDF', sub: 'Rapport' },
                      { key: 'xlsx', label: 'Excel', sub: 'Données' },
                      { key: 'csv', label: 'CSV', sub: 'Brut' }
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => { setFormat(f.key); setGenerationSuccess(false); }}
                        className={`p-2 rounded-md border transition-colors text-center ${
                          format === f.key
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'bg-white border-[#e5e5e5] text-[#171717] hover:bg-[#fafafa]'
                        }`}
                      >
                        <p className="text-xs font-medium">{f.label}</p>
                        <p className={`text-[9px] mt-0.5 ${format === f.key ? 'text-[#a3a3a3]' : 'text-[#737373]'}`}>{f.sub}</p>
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
                  className="w-full flex items-center justify-center gap-2 bg-[#171717] hover:bg-[#262626] disabled:bg-[#a3a3a3] text-white text-xs font-medium py-3 rounded-md transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Génération du rapport en cours...
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Générer le rapport ({format.toUpperCase()})
                    </>
                  )}
                </button>
              </div>

              {/* Notification succès de génération */}
              {generationSuccess && (
                <div className="bg-[#f5f5f5] border border-[#e5e5e5] rounded-md p-3.5 flex justify-between items-center">
                  <div className="flex gap-2.5 items-center">
                    <CheckCircle2 size={16} className="text-[#171717] shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#171717]">Rapport généré avec succès</p>
                      <p className="text-[11px] text-[#737373]">Fichier prêt au téléchargement.</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors">
                    <Download size={12} /> Télécharger
                  </button>
                </div>
              )}
            </div>

            {/* Volet Suggestions & Statut */}
            <div className="space-y-4">
              <div className="bg-[#171717] text-white rounded-md p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-white" />
                  <h3 className="font-semibold text-xs tracking-tight">Recommandations IA</h3>
                </div>
                <p className="text-[11px] text-[#a3a3a3] leading-relaxed">
                  Sur la base des dernières soumissions, nous vous suggérons d&apos;extraire :
                </p>
                <div className="space-y-2">
                  {[
                    { title: 'SLA Breach Report (Finance)', desc: 'Respect du délai moyen à surveiller.' },
                    { title: 'Volume Peak Analysis (Notes)', desc: 'Augmentation prévisible des réclamations semestrielles.' }
                  ].map(sug => (
                    <button
                      key={sug.title}
                      onClick={() => setGenerationSuccess(false)}
                      className="w-full text-left p-2.5 rounded bg-[#262626] hover:bg-[#333333] transition-colors border border-white/10"
                    >
                      <p className="text-xs font-medium text-white">{sug.title}</p>
                      <p className="text-[10px] text-[#a3a3a3] mt-0.5">{sug.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicateur de volume d'archivage */}
              <div className="bg-white border border-[#e5e5e5] rounded-md p-3.5 space-y-2.5">
                <h4 className="font-semibold text-[#171717] text-xs">Stockage des rapports</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#737373]">Capacité occupée</span>
                  <span className="font-semibold text-[#171717]">1.2 Go / 10 Go</span>
                </div>
                <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#171717] rounded-full" style={{ width: '12%' }} />
                </div>
                <p className="text-[10px] text-[#737373] leading-relaxed">
                  Conservation automatique des synthèses sur une durée de 30 jours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. ONGLET HISTORIQUE DES RAPPORTS ── */}
        {activeTab === 'historique' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[700px]">
              <thead className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <tr>
                  {['Nom du fichier', 'Type', 'Date', 'Format', 'Taille', 'Auteur', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 font-semibold text-[#737373] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {HISTORIQUE_RAPPORTS.map(r => (
                  <tr key={r.id} className="hover:bg-[#fafafa] transition-colors group">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-[#737373]" />
                        <span className="font-medium text-[#171717] truncate max-w-[200px]">{r.nom}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#737373]">{r.type}</td>
                    <td className="py-2.5 px-3 text-[#737373]">{r.date}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">{r.format}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#737373]">{r.taille}</td>
                    <td className="py-2.5 px-3 font-medium text-[#171717]">{r.auteur}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                        {r.statut}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <button className="w-6 h-6 rounded hover:bg-[#f5f5f5] flex items-center justify-center text-[#737373] hover:text-[#171717] transition-colors" title="Télécharger">
                          <Download size={12} />
                        </button>
                        <button className="w-6 h-6 rounded hover:bg-[#f5f5f5] flex items-center justify-center text-[#737373] hover:text-[#171717] transition-colors" title="Supprimer">
                          <Trash2 size={12} />
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
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-xs text-[#171717]">Rapports programmés</h3>
                <p className="text-[11px] text-[#737373] mt-0.5">Expéditions récurrentes aux boîtes de service.</p>
              </div>
              <button className="flex items-center gap-1.5 bg-[#171717] hover:bg-[#262626] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors">
                <Plus size={12} /> Programmer un rapport
              </button>
            </div>

            <div className="overflow-x-auto border border-[#e5e5e5] rounded-md overflow-hidden mt-3">
              <table className="w-full text-xs">
                <thead className="bg-[#fafafa] border-b border-[#e5e5e5]">
                  <tr>
                    {['Nom', 'Type', 'Fréquence', 'Destinataire', 'Format', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 font-semibold text-[#737373] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {RAPPORTS_PLANIFIES.map(p => (
                    <tr key={p.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-[#737373]" />
                          <span className="font-medium text-[#171717]">{p.nom}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-[#737373]">{p.type}</td>
                      <td className="py-2.5 px-3 font-mono text-[#171717]">{p.frequence}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 text-[#737373]">
                          <Mail size={11} />
                          <span>{p.destinataire}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">{p.format}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                          {p.statut}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-[#737373] hover:text-[#171717] transition-colors">
                            Suspendre
                          </button>
                          <button className="w-5 h-5 rounded hover:bg-[#f5f5f5] flex items-center justify-center text-[#737373] hover:text-[#171717]">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-md p-3 flex gap-2.5 items-start mt-2">
              <AlertCircle size={14} className="text-[#737373] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#737373] leading-relaxed">
                Les rapports programmés sont expédiés automatiquement en pièces jointes sécurisées aux adresses associées.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
