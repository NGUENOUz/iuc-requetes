'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, FileText, Clock, CheckCircle, XCircle, Calendar,
  User, MessageCircle, Paperclip, Download, Send, AlertCircle
} from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';

// Données mockées - À remplacer par des données réelles depuis une API
const REQUETE_DETAILS = {
  id: 'REQ-1248',
  titre: 'Réclamation de note',
  categorie: 'Scolarité',
  statut: 'En cours',
  priorite: 'Haute',
  dateCreation: '19 mai 2025',
  dateModification: '20 mai 2025',
  description: 'Bonjour, je souhaite contester ma note de l\'examen de Mathématiques du 15 mai 2025. Après vérification de ma copie, je pense qu\'il y a une erreur dans la correction de la question 3 et 5. Je demande une révision de ma copie.',
  service: 'Service Scolarité',
  agentAssigne: 'M. TAMBA Jean',
  pieceJointe: 'copie_examen_math.pdf',
  historique: [
    { date: '20 mai 2025 14:30', action: 'Requête assignée à M. TAMBA', statut: 'En cours' },
    { date: '19 mai 2025 16:45', action: 'Requête reçue et en attente de traitement', statut: 'En attente' },
    { date: '19 mai 2025 16:40', action: 'Requête créée', statut: 'Créée' },
  ],
  messages: [
    {
      id: 1,
      auteur: 'M. TAMBA Jean',
      role: 'Personnel',
      date: '20 mai 2025 14:35',
      message: 'Bonjour NGUENOU Wilfried, nous avons bien reçu votre demande de réclamation. Votre copie est actuellement en cours de révision par l\'enseignant concerné. Vous recevrez une réponse sous 48h.',
    },
  ],
};

const statutStyle: Record<string, { bg: string; text: string; icon: any }> = {
  'En attente': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  'En cours': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  'Résolue': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  'Rejetée': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

function RequeteDetailsContent() {
  const [nouveauMessage, setNouveauMessage] = useState('');
  const { bg, text, icon: StatusIcon } = statutStyle[REQUETE_DETAILS.statut];

  return (
    <div className="p-3 sm:p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
          Tableau de bord
        </Link>
        <span>/</span>
        <Link href="/mes-requetes" className="hover:text-emerald-600 transition-colors">
          Mes requêtes
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">#{REQUETE_DETAILS.id}</span>
      </div>

      {/* Bouton retour */}
      <Link
        href="/mes-requetes"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        Retour à mes requêtes
      </Link>

      {/* En-tête */}
      <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900">{REQUETE_DETAILS.titre}</h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${bg} ${text}`}>
                <StatusIcon size={14} />
                {REQUETE_DETAILS.statut}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-2">Requête #{REQUETE_DETAILS.id}</p>
          </div>
        </div>

        {/* Infos rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-slate-500 mb-1">Catégorie</p>
            <p className="text-sm font-bold text-slate-900">{REQUETE_DETAILS.categorie}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Priorité</p>
            <p className="text-sm font-bold text-red-600">{REQUETE_DETAILS.priorite}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Date de création</p>
            <p className="text-sm font-bold text-slate-900">{REQUETE_DETAILS.dateCreation}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Dernière modification</p>
            <p className="text-sm font-bold text-slate-900">{REQUETE_DETAILS.dateModification}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText size={18} />
              Description de la requête
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed">{REQUETE_DETAILS.description}</p>

            {REQUETE_DETAILS.pieceJointe && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-slate-500 mb-2">Pièce jointe</p>
                <button className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium transition-colors">
                  <Paperclip size={16} />
                  {REQUETE_DETAILS.pieceJointe}
                  <Download size={14} className="ml-auto" />
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageCircle size={18} />
              Messages ({REQUETE_DETAILS.messages.length})
            </h2>

            <div className="space-y-4">
              {REQUETE_DETAILS.messages.map((msg) => (
                <div key={msg.id} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {msg.auteur.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm">{msg.auteur}</p>
                        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded">{msg.role}</span>
                        <span className="text-xs text-slate-500 ml-auto">{msg.date}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-2">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Formulaire nouveau message */}
              <div className="pt-4 border-t">
                <p className="text-sm font-bold text-slate-900 mb-3">Envoyer un message</p>
                <textarea
                  value={nouveauMessage}
                  onChange={(e) => setNouveauMessage(e.target.value)}
                  placeholder="Écrivez votre message ici..."
                  className="w-full h-24 bg-slate-50 rounded-xl p-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                    <Send size={14} />
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-5">
          {/* Informations */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-1">Service</p>
                <p className="font-medium text-slate-900">{REQUETE_DETAILS.service}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Agent assigné</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                    {REQUETE_DETAILS.agentAssigne.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <p className="font-medium text-slate-900">{REQUETE_DETAILS.agentAssigne}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Historique */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={16} />
              Historique
            </h3>
            <div className="space-y-3">
              {REQUETE_DETAILS.historique.map((h, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">{h.date}</p>
                    <p className="text-sm text-slate-700 font-medium mt-0.5">{h.action}</p>
                    <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1">
                      {h.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aide */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900">Besoin d'aide ?</p>
                <p className="text-xs text-blue-700 mt-1">
                  Si vous avez des questions, n'hésitez pas à envoyer un message via le formulaire ci-contre.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RequeteDetailsPage() {
  return (
    <StudentLayout>
      <RequeteDetailsContent />
    </StudentLayout>
  );
}
