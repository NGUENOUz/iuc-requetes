'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain, Send, User, Sparkles, Database, HelpCircle,
  CheckCircle2, RefreshCw, Zap, Sliders, ArrowRight,
  TrendingUp, BarChart3, Clock, AlertCircle
} from 'lucide-react';

/* ═══════════════════════ TYPES & CONFIG ═══════════════════════ */

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
  metrics?: { label: string; value: string; color: string }[];
}

const CONTEXT_CAPABILITIES = [
  { label: 'Analyse de charge', desc: 'Déterminer si un agent ou un service est surchargé de requêtes.' },
  { label: 'Détection des retards SLA', desc: 'Lister les requêtes proches du dépassement de délai de 48h.' },
  { label: 'Rédaction de réponses', desc: 'Rédiger une réponse type pour une réclamation de note litigieuse.' },
  { label: 'Synthèse de satisfaction', desc: 'Résumer les avis négatifs des étudiants ce mois-ci.' },
];

const PRESETS = [
  'Quels agents sont actuellement surchargés ?',
  'Analyse la performance de Eric Tamba',
  'Quelles sont les réclamations de notes critiques ?',
  'Rédige un e-mail de relance pour la scolarité',
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: 'Bonjour Administrateur. Je suis l\'Assistant IA intégré d\'IUC Requêtes. Je suis connecté en temps réel aux données de l\'établissement, aux profils étudiants, aux plannings et au personnel. Que puis-je analyser pour vous aujourd\'hui ?',
    timestamp: '18:00',
    suggestions: [
      'Analyser les goulots d\'étranglement Scolarité',
      'Identifier les requêtes en retard critique',
      'Faire un bilan de satisfaction global'
    ]
  }
];

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminAssistantIaPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeModel, setActiveModel] = useState('Gemini 1.5 Pro');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* Simulation de l&apos;IA avec réponses contextuelles */
  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulation du temps de calcul
    setTimeout(() => {
      let responseText = "Je comprends votre requête. Je suis en train d'analyser la base de données d'IUC Requêtes pour formuler une réponse précise.";
      let suggestions: string[] = [];
      let metrics: { label: string; value: string; color: string }[] = [];

      const normalized = textToSend.toLowerCase();

      if (normalized.includes('charge') || normalized.includes('surchargé')) {
        responseText = "Après analyse des dossiers en cours par agent, j'ai détecté un déséquilibre de charge. \n\n**M. TAMBA Eric** gère actuellement **12 dossiers actifs** (dont 4 réclamations prioritaires) alors que la moyenne de l'équipe est de 8. **Mme FOUDA Martine** dispose quant à elle d'une charge plus faible (8 dossiers en cours) avec un taux de résolution de 100% ce mois-ci.";
        metrics = [
          { label: 'TAMBA Eric', value: '12 actifs (Élevé)', color: 'text-red-600 bg-red-50 border-red-100' },
          { label: 'FOUDA Martine', value: '8 actifs (Normal)', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Optimisation suggérée', value: 'Transfert de 2 dossiers', color: 'text-violet-600 bg-violet-50 border-violet-100' }
        ];
        suggestions = ['Réassigner 2 dossiers de Eric à Martine', 'Voir le profil de Eric Tamba'];
      } else if (normalized.includes('performance') || normalized.includes('tamba')) {
        responseText = "Voici le profil analytique de l'agent **TAMBA Eric** (Scolarité) :\n\n* **Efficacité** : Excellent taux de résolution global (**92%**).\n* **Vitesse** : Temps de traitement moyen de **1.8 jours** (inférieur à la moyenne du service de 2.2 jours).\n* **Satisfaction** : Note moyenne de **4.8/5** sur 124 retours d'étudiants.\n* **Point de vigilance** : Une augmentation de sa charge de travail a été constatée ces 5 derniers jours.";
        metrics = [
          { label: 'Respect SLA', value: '92%', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Satisfaction', value: '4.8/5', color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Temps moyen', value: '1.8j', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
        ];
        suggestions = ['Analyser les catégories de Eric Tamba', 'Rédiger une évaluation annuelle'];
      } else if (normalized.includes('retard') || normalized.includes('critique') || normalized.includes('sla')) {
        responseText = "J'ai identifié **4 requêtes critiques** en dépassement ou proche du dépassement de la limite de temps de traitement (48h) :\n\n1. **REQ-1248** (Réclamation de note - NGUENOU Wilfried) : Assignée à Eric Tamba, en attente d'une validation du chef de département pédagogique depuis 36h.\n2. **REQ-1260** (Correction de relevé - TCHOUTA Marc) : Non assignée, en attente depuis 28h.\n3. **REQ-1089** (Problème de paiement - DJOMO Grace) : Assignée à Rachel Ayissi (Finance), en attente d'une pièce comptable depuis 44h.";
        suggestions = ['Assigner REQ-1260 immédiatement', 'Notifier les agents en retard'];
      } else if (normalized.includes('e-mail') || normalized.includes('rédige')) {
        responseText = "Voici une proposition d'e-mail de relance automatique pour le service Scolarité :\n\n```text\nObjet : Relance urgente - Dossier en attente de validation pédagogique\n\nBonjour M. le Responsable Pédagogique,\n\nNous vous relançons concernant le traitement de la réclamation de note #REQ-1248 soumise par l'étudiant NGUENOU Wilfried.\n\nCe dossier est en attente de votre avis académique depuis 36h, approchant de la limite critique de notre engagement SLA (48h).\n\nMerci de valider ou rejeter la correction proposée directement via votre espace.\n\nCordialement,\nLe Secrétariat Académique IUC\n```";
        suggestions = ['Envoyer cet e-mail', 'Modifier le brouillon'];
      }

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        metrics: metrics.length > 0 ? metrics : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto h-[calc(100vh-4rem)] flex flex-col gap-4">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Brain size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Assistant IA Décisionnel</h1>
            <p className="text-slate-500 text-xs mt-0.5">Votre copilote d&apos;analyse de données et d&apos;aide à la décision opérationnelle.</p>
          </div>
        </div>
        
        {/* Modèle de LLM et crédits */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200">
            {['Gemini 1.5 Pro', 'Gemini 1.5 Flash'].map(m => (
              <button
                key={m}
                onClick={() => setActiveModel(m)}
                className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all ${
                  activeModel === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-xl flex items-center gap-1 shrink-0">
            <Zap size={11} /> 78% crédits restants
          </span>
        </div>
      </div>

      {/* ── Contenu Principal ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Volet Chat (3/4 de large) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full relative">
          
          {/* Messages de discussion */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-black text-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm'
                }`}>
                  {msg.sender === 'user' ? 'AD' : <Brain size={13} />}
                </div>

                {/* Bulle de texte */}
                <div className="space-y-2">
                  <div className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-slate-50 text-slate-800 border border-slate-100 whitespace-pre-line'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Badges métriques IA */}
                  {msg.metrics && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5">
                      {msg.metrics.map(met => (
                        <div key={met.label} className={`p-2.5 rounded-xl border text-[11px] font-bold ${met.color}`}>
                          <p className="opacity-60">{met.label}</p>
                          <p className="text-xs font-black mt-0.5">{met.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions de réponses IA */}
                  {msg.suggestions && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {msg.suggestions.map(sug => (
                        <button
                          key={sug}
                          onClick={() => handleSend(sug)}
                          className="text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className={`text-[9px] text-slate-400 font-mono mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {/* Effet d&apos;écriture de l&apos;IA */}
            {isTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Brain size={13} />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Formulaire de saisie de messages */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <form
              onSubmit={e => { e.preventDefault(); handleSend(input); }}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 pl-3 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition-all shadow-sm"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Posez une question sur le personnel, la scolarité, les retards SLA..."
                className="flex-1 outline-none text-xs text-slate-700 bg-transparent py-1.5"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-indigo-600/10"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>

        {/* Volet contextuel (1/4 de large) */}
        <div className="space-y-4">
          
          {/* Indexation de la base */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Base de connaissances</span>
              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <Database size={9} /> À jour
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              L&apos;IA est synchronisée avec la base de données PostgreSQL d&apos;IUC (dernière indexation il y a 2 heures).
            </p>
            <button className="w-full flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600 py-2 rounded-xl transition-all shadow-sm">
              <RefreshCw size={11} /> Re-synchroniser
            </button>
          </div>

          {/* Raccourcis / Questions suggérées */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <HelpCircle size={14} className="text-slate-400" />
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Analyses instantanées</h4>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              {PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => handleSend(preset)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 text-xs text-slate-600 font-semibold transition-all group flex items-start gap-2 justify-between"
                  disabled={isTyping}
                >
                  <span className="group-hover:text-indigo-700 truncate">{preset}</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-indigo-600 shrink-0 mt-0.5 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Capacités de l&apos;assistant */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Compétences de l&apos;IA</h4>
            <div className="space-y-3 pt-1">
              {CONTEXT_CAPABILITIES.map(cap => (
                <div key={cap.label} className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-700">{cap.label}</p>
                  <p className="text-[10px] text-slate-400 leading-normal">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
