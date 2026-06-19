'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain, Send, Sparkles, Database, HelpCircle,
  RefreshCw, Zap, ArrowRight, ArrowLeft
} from 'lucide-react';
import { useAIChat } from '@/lib/hooks';

const CONTEXT_CAPABILITIES = [
  { label: 'Analyse de charge', desc: 'Déterminer si un agent ou un service est surchargé de requêtes.' },
  { label: 'Détection des retards SLA', desc: 'Lister les requêtes proches du dépassement de délai de 48h.' },
  { label: 'Rédaction de réponses', desc: 'Rédiger une réponse type pour une réclamation de note litigieuse.' },
  { label: 'Synthèse de satisfaction', desc: 'Résumer les avis négatifs des étudiants ce mois-ci.' },
];

const PRESETS = [
  'Quels agents sont actuellement surchargés ?',
  'Analyse la performance globale de traitement',
  'Quelles sont les réclamations de notes critiques ?',
  'Rédige un e-mail de relance pour la scolarité',
];

// Rendu Markdown personnalisé
function parseInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-200/80 px-1 py-0.5 rounded text-[11px] font-mono text-indigo-700">$1</code>');
}

function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const code = match ? match[2] : part.slice(3, -3);
          return (
            <pre key={index} className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-[10px] font-mono leading-relaxed border border-slate-800 my-2">
              <code>{code.trim()}</code>
            </pre>
          );
        }

        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-1">
            {lines.map((line, lineIdx) => {
              if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                const cleanText = line.replace(/^\s*[\*\-]\s+/, '');
                return (
                  <ul key={lineIdx} className="list-disc list-inside ml-2">
                    <li className="inline" dangerouslySetInnerHTML={{ __html: parseInline(cleanText) }} />
                  </ul>
                );
              }
              const oListMatch = line.trim().match(/^\d+\.\s+(.*)/);
              if (oListMatch) {
                return (
                  <ol key={lineIdx} className="list-decimal list-inside ml-2">
                    <li className="inline" dangerouslySetInnerHTML={{ __html: parseInline(oListMatch[1]) }} />
                  </ol>
                );
              }
              return (
                <p key={lineIdx} className="min-h-[1em]" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAssistantIaPage() {
  const { messages, sendMessage, regenerate, clearHistory, isLoading } = useAIChat();
  const [input, setInput] = useState('');
  const [activeModel, setActiveModel] = useState('Gemini 1.5 Pro');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    sendMessage(textToSend, activeModel === 'Gemini 1.5 Pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash');
    setInput('');
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto h-[calc(100vh-4rem)] flex flex-col gap-4">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
            <ArrowLeft size={16} />
          </Link>
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
          <button 
            onClick={clearHistory}
            className="text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            Effacer
          </button>
          <span className="text-[10px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-xl flex items-center gap-1 shrink-0">
            <Zap size={11} /> 100% crédits
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
                <div className="space-y-2 max-w-full">
                  <div className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : msg.error 
                        ? 'bg-red-50 text-red-800 border border-red-100'
                        : 'bg-slate-50 text-slate-800 border border-slate-100'
                  }`}>
                    {msg.sender === 'user' ? msg.text : <MarkdownText text={msg.text} />}
                  </div>

                  {/* Badges métriques IA */}
                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1.5">
                      {msg.metrics.map(met => (
                        <div key={met.label} className={`p-2.5 rounded-xl border text-[11px] font-bold ${met.color || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                          <p className="opacity-60">{met.label}</p>
                          <p className="text-xs font-black mt-0.5">{met.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions de réponses IA */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
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

            {/* Effet d'écriture de l'IA */}
            {isLoading && (
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
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
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
              L&apos;IA est synchronisée avec la base de données PostgreSQL d&apos;IUC (connexion directe en temps réel).
            </p>
            <button 
              onClick={() => regenerate(activeModel === 'Gemini 1.5 Pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash')}
              className="w-full flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600 py-2 rounded-xl transition-all shadow-sm"
              disabled={isLoading}
            >
              <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} /> Régénérer la réponse
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
                  disabled={isLoading}
                >
                  <span className="group-hover:text-indigo-700 truncate">{preset}</span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-indigo-600 shrink-0 mt-0.5 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Capacités de l'assistant */}
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
