'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
  metrics?: { label: string; value: string; color: string }[];
  error?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: "Bonjour Administrateur. Je suis l'Assistant IA intégré d'IUC Requêtes. Je suis connecté en temps réel aux données de l'établissement, aux profils étudiants, aux plannings et au personnel. Que puis-je analyser pour vous aujourd'hui ?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      "Analyser les goulots d'étranglement Scolarité",
      "Identifier les requêtes en retard critique",
      "Faire un bilan de satisfaction global"
    ]
  }
];

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const mutation = useMutation({
    mutationFn: async ({ text, model }: { text: string; model?: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text,
          context: { model },
        }),
      });


      if (!response.ok) {
        throw new Error('Une erreur est survenue lors de la communication avec l\'IA.');
      }

      const resJson = await response.json();
      return resJson.data;
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: data.suggestions || [],
        metrics: data.metrics || [],
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    onError: (error: any) => {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: error.message || "Erreur de connexion. Impossible de contacter l'IA.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const sendMessage = (text: string, model?: string) => {
    if (!text.trim() || mutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    mutation.mutate({ text, model });
  };

  const regenerate = (model?: string) => {
    // Retrouver le dernier message de l'utilisateur
    const userMessages = messages.filter((m) => m.sender === 'user');
    if (userMessages.length === 0) return;
    const lastUserMessage = userMessages[userMessages.length - 1];

    // Lancer la mutation
    mutation.mutate({ text: lastUserMessage.text, model });
  };

  const clearHistory = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return {
    messages,
    sendMessage,
    regenerate,
    clearHistory,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
