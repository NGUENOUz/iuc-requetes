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
  { label: 'Synthèse de satisfaction', desc: 'Résumer les avis usagers et identifier les axes d\'amélioration.' },
];

const PRESETS = [
  'Quels agents sont actuellement surchargés ?',
  'Analyse la performance globale de traitement',
  'Quelles sont les réclamations de notes critiques ?',
  'Rédige un e-mail de relance pour la scolarité',
];

function parseInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-[#f0f0f0] dark:bg-[#27272a] px-1 py-0.5 rounded text-[11px] font-mono text-[#171717] dark:text-white">$1</code>');
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
            <pre key={index} className="bg-[#171717] text-white p-3 rounded-md overflow-x-auto text-[10px] font-mono leading-relaxed border border-[#262626] my-2">
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
      <div className="flex flex-wrap items-center justify-between gap-4 shrink-0 border-b border-[#e5e5e5] dark:border-[#27272a] pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 bg-white dark:bg-[#18181b] hover:bg-[#f5f5f5] text-[#171717] dark:text-white rounded-md border border-[#e5e5e5] dark:border-[#27272a] transition-colors">
            <ArrowLeft size={14} />
          </Link>
          <div className="w-9 h-9 rounded-md bg-[#171717] dark:bg-white text-white dark:text-black flex items-center justify-center">
            <Brain size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#171717] dark:text-white tracking-tight">Assistant IA Décisionnel</h1>
            <p className="text-[#737373] text-xs mt-0.5">Copilote d&apos;analyse de données et d&apos;aide aux décisions opérationnelles</p>
          </div>
        </div>
        
        {/* Modèle de LLM et crédits */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#f5f5f5] dark:bg-[#18181b] rounded-md p-0.5 gap-0.5 border border-[#e5e5e5] dark:border-[#27272a]">
            {['Gemini 1.5 Pro', 'Gemini 1.5 Flash'].map(m => (
              <button
                key={m}
                onClick={() => setActiveModel(m)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded transition-colors ${
                  activeModel === m ? 'bg-white dark:bg-[#121215] text-[#171717] dark:text-white font-medium shadow-2xs' : 'text-[#737373] hover:text-[#171717] dark:hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button 
            onClick={clearHistory}
            className="text-xs font-medium text-[#737373] hover:text-[#171717] dark:hover:text-white bg-white dark:bg-[#18181b] px-3 py-1.5 rounded-md border border-[#e5e5e5] dark:border-[#27272a] transition-colors"
          >
            Effacer
          </button>
          <span className="text-[10px] font-mono font-medium bg-[#f5f5f5] dark:bg-[#18181b] border border-[#e5e5e5] dark:border-[#27272a] text-[#171717] dark:text-white px-2 py-1.5 rounded-md flex items-center gap-1 shrink-0">
            <Zap size={11} /> Prêt
          </span>
        </div>
      </div>

      {/* ── Contenu Principal ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Volet Chat (3/4 de large) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#121215] rounded-md border border-[#e5e5e5] dark:border-[#27272a] overflow-hidden flex flex-col h-full relative">
          
          {/* Messages de discussion */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center font-bold text-[10px] font-mono ${
                  msg.sender === 'user'
                    ? 'bg-[#171717] text-white dark:bg-white dark:text-black'
                    : 'bg-[#f5f5f5] dark:bg-[#18181b] text-[#171717] dark:text-white border border-[#e5e5e5] dark:border-[#27272a]'
                }`}>
                  {msg.sender === 'user' ? 'MOI' : <Brain size={12} />}
                </div>

                {/* Bulle de texte */}
                <div className="space-y-2 max-w-full">
                  <div className={`rounded-md p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#171717] text-white dark:bg-white dark:text-black'
                      : msg.error 
                        ? 'bg-red-50 text-red-900 border border-red-200 dark:bg-red-950/20 dark:text-red-200'
                        : 'bg-[#fafafa] dark:bg-[#18181b] text-[#171717] dark:text-[#f4f4f5] border border-[#e5e5e5] dark:border-[#27272a]'
                  }`}>
                    {msg.sender === 'user' ? msg.text : <MarkdownText text={msg.text} />}
                  </div>

                  {/* Badges métriques IA */}
                  {msg.metrics && msg.metrics.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {msg.metrics.map(met => (
                        <div key={met.label} className="p-2 rounded-md border border-[#e5e5e5] dark:border-[#27272a] bg-[#fafafa] dark:bg-[#18181b] text-[11px]">
                          <p className="text-[#737373]">{met.label}</p>
                          <p className="text-xs font-semibold text-[#171717] dark:text-white font-mono mt-0.5">{met.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions de réponses IA */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map(sug => (
                        <button
                          key={sug}
                          onClick={() => handleSend(sug)}
                          className="text-[11px] font-medium bg-white dark:bg-[#18181b] hover:bg-[#fafafa] text-[#171717] dark:text-white border border-[#e5e5e5] dark:border-[#27272a] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className={`text-[9px] text-[#737373] font-mono mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {/* Effet d'écriture de l'IA */}
            {isLoading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-md bg-[#f5f5f5] dark:bg-[#18181b] border border-[#e5e5e5] dark:border-[#27272a] text-[#171717] dark:text-white flex items-center justify-center shrink-0">
                  <Brain size={12} className="animate-spin" />
                </div>
                <div className="bg-[#fafafa] dark:bg-[#18181b] border border-[#e5e5e5] dark:border-[#27272a] rounded-md p-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#171717] dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#171717] dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#171717] dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Formulaire de saisie de messages */}
          <div className="p-3 border-t border-[#e5e5e5] dark:border-[#27272a] bg-[#fafafa] dark:bg-[#0c0c0e]">
            <form
              onSubmit={e => { e.preventDefault(); handleSend(input); }}
              className="flex items-center gap-2 bg-white dark:bg-[#121215] border border-[#e5e5e5] dark:border-[#27272a] rounded-md p-1 pl-3 focus-within:border-[#171717] dark:focus-within:border-white transition-colors"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Posez une question sur le flux des requêtes, le personnel, les SLA..."
                className="flex-1 outline-none text-xs text-[#171717] dark:text-white placeholder:text-[#a3a3a3] bg-transparent py-1.5"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-[#171717] hover:bg-[#262626] dark:bg-white dark:hover:bg-[#e4e4e7] disabled:bg-[#d4d4d4] dark:disabled:bg-[#3f3f46] text-white dark:text-black w-7 h-7 rounded flex items-center justify-center transition-colors shrink-0 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>

        {/* Volet contextuel (1/4 de large) */}
        <div className="space-y-4">
          
          {/* Indexation de la base */}
          <div className="bg-white dark:bg-[#121215] rounded-md border border-[#e5e5e5] dark:border-[#27272a] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#171717] dark:text-white">Base de connaissances</span>
              <span className="bg-[#f5f5f5] dark:bg-[#18181b] text-[#171717] dark:text-white border border-[#e5e5e5] dark:border-[#27272a] text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                <Database size={10} /> À jour
              </span>
            </div>
            <p className="text-[11px] text-[#737373] leading-relaxed">
              Synchronisé en temps réel avec la base locale de requêtes et le registre institutionnel.
            </p>
            <button 
              onClick={() => regenerate(activeModel === 'Gemini 1.5 Pro' ? 'gemini-1.5-pro' : 'gemini-1.5-flash')}
              className="w-full flex items-center justify-center gap-1.5 border border-[#e5e5e5] dark:border-[#27272a] hover:bg-[#fafafa] dark:hover:bg-[#18181b] text-xs font-medium text-[#171717] dark:text-white py-1.5 rounded-md transition-colors"
              disabled={isLoading}
            >
              <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} /> Régénérer l&apos;analyse
            </button>
          </div>

          {/* Raccourcis / Questions suggérées */}
          <div className="bg-white dark:bg-[#121215] rounded-md border border-[#e5e5e5] dark:border-[#27272a] p-3.5 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <HelpCircle size={13} className="text-[#737373]" />
              <h4 className="font-semibold text-xs text-[#171717] dark:text-white">Analyses instantanées</h4>
            </div>
            <div className="flex flex-col gap-1.5 pt-0.5">
              {PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => handleSend(preset)}
                  className="w-full text-left p-2 rounded-md border border-[#e5e5e5] dark:border-[#27272a] hover:bg-[#fafafa] dark:hover:bg-[#18181b] text-xs text-[#737373] hover:text-[#171717] dark:hover:text-white transition-colors group flex items-start gap-2 justify-between"
                  disabled={isLoading}
                >
                  <span className="truncate">{preset}</span>
                  <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 text-[#171717] dark:text-white shrink-0 mt-0.5 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Capacités de l'assistant */}
          <div className="bg-white dark:bg-[#121215] border border-[#e5e5e5] dark:border-[#27272a] rounded-md p-3.5 space-y-2.5">
            <h4 className="font-semibold text-xs text-[#171717] dark:text-white">Compétences de l&apos;IA</h4>
            <div className="space-y-2 pt-0.5">
              {CONTEXT_CAPABILITIES.map(cap => (
                <div key={cap.label} className="space-y-0.5">
                  <p className="text-xs font-medium text-[#171717] dark:text-white">{cap.label}</p>
                  <p className="text-[10px] text-[#737373] leading-relaxed">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
