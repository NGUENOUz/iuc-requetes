'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell, CheckCircle, Clock, AlertTriangle, Info, Home,
  Check, Trash2, Filter, Eye, EyeOff, ArrowLeft
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'success',
    titre: 'Requête résolue',
    message: 'Votre demande de changement de groupe TP a été acceptée. Nouveau groupe: TP-A2.',
    requete: 'REQ-1246',
    date: '20 mai 2025 15:30',
    lue: false,
  },
  {
    id: 2,
    type: 'info',
    titre: 'Requête en cours de traitement',
    message: 'Votre réclamation de note est actuellement en cours de vérification par le service scolarité.',
    requete: 'REQ-1248',
    date: '20 mai 2025 14:35',
    lue: false,
  },
  {
    id: 3,
    type: 'warning',
    titre: 'Document manquant',
    message: 'Veuillez joindre une copie de votre pièce d\'identité pour finaliser votre demande d\'attestation.',
    requete: 'REQ-1247',
    date: '19 mai 2025 16:20',
    lue: false,
  },
  {
    id: 4,
    type: 'info',
    titre: 'Nouvelle réponse',
    message: 'M. TAMBA a répondu à votre requête. Consultez votre requête pour plus de détails.',
    requete: 'REQ-1248',
    date: '19 mai 2025 10:15',
    lue: true,
  },
  {
    id: 5,
    type: 'success',
    titre: 'Requête traitée',
    message: 'Votre demande d\'attestation d\'inscription est prête. Document disponible au secrétariat.',
    requete: 'REQ-1243',
    date: '18 mai 2025 14:00',
    lue: true,
  },
  {
    id: 6,
    type: 'info',
    titre: 'Requête assignée',
    message: 'Votre requête a été assignée à M. TAMBA du service scolarité.',
    requete: 'REQ-1248',
    date: '17 mai 2025 09:30',
    lue: true,
  },
  {
    id: 7,
    type: 'success',
    titre: 'Requête acceptée',
    message: 'Votre demande a été reçue et est en cours de traitement. Vous recevrez une réponse sous 48h.',
    requete: 'REQ-1248',
    date: '16 mai 2025 16:40',
    lue: true,
  },
];

const TYPES = [
  { value: 'all', label: 'Toutes', count: NOTIFICATIONS.length },
  { value: 'success', label: 'Résolues', count: NOTIFICATIONS.filter(n => n.type === 'success').length },
  { value: 'info', label: 'Informations', count: NOTIFICATIONS.filter(n => n.type === 'info').length },
  { value: 'warning', label: 'Alertes', count: NOTIFICATIONS.filter(n => n.type === 'warning').length },
];

const typeConfig = {
  success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-600' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-600' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', iconColor: 'text-yellow-600' },
};

function NotificationsContent() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const filtered = notifications.filter(n => {
    const matchType = typeFilter === 'all' || n.type === typeFilter;
    const matchRead = !showOnlyUnread || !n.lue;
    return matchType && matchRead;
  });

  const unreadCount = notifications.filter(n => !n.lue).length;

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(filtered.map(n => n.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const markAsRead = (ids: number[]) => {
    setNotifications(prev =>
      prev.map(n => (ids.includes(n.id) ? { ...n, lue: true } : n))
    );
    setSelectedIds([]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
  };

  const deleteNotifications = (ids: number[]) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
    setSelectedIds([]);
  };

  return (
    <div className="p-3 sm:p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
          <Home size={14} />
          Tableau de bord
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Notifications</span>
      </div>

      {/* Bouton retour */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        Retour au tableau de bord
      </Link>

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Restez informé de l'évolution de vos requêtes
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            <Check size={16} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres et actions */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
        {/* Types */}
        <div className="flex flex-wrap gap-2">
          {TYPES.map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                typeFilter === value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
          <button
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showOnlyUnread
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Filter size={14} />
            {showOnlyUnread ? 'Non lues uniquement' : 'Afficher toutes'}
          </button>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                {selectedIds.length} sélectionnée{selectedIds.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => markAsRead(selectedIds)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                <Eye size={14} />
                Marquer comme lu
              </button>
              <button
                onClick={() => deleteNotifications(selectedIds)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors"
              >
                <Trash2 size={14} />
                Supprimer
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}

          {filtered.length > 0 && selectedIds.length === 0 && (
            <button
              onClick={selectAll}
              className="text-sm text-slate-600 hover:text-emerald-600 font-medium"
            >
              Tout sélectionner
            </button>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
            <Bell size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">Aucune notification</p>
            <p className="text-sm text-slate-400 mt-1">
              {showOnlyUnread
                ? 'Vous n\'avez aucune notification non lue'
                : 'Vous n\'avez aucune notification pour le moment'}
            </p>
          </div>
        ) : (
          filtered.map((notif) => {
            const config = typeConfig[notif.type as keyof typeof typeConfig];
            const Icon = config.icon;
            const isSelected = selectedIds.includes(notif.id);

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${
                  isSelected ? 'ring-2 ring-emerald-500' : ''
                } ${!notif.lue ? 'border-l-4 border-l-emerald-500' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(notif.id)}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-400 mt-1 cursor-pointer"
                    />

                    {/* Icône */}
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={20} className={config.iconColor} />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className={`font-bold text-slate-900 ${!notif.lue ? 'text-emerald-900' : ''}`}>
                          {notif.titre}
                          {!notif.lue && (
                            <span className="ml-2 inline-block w-2 h-2 bg-emerald-500 rounded-full" />
                          )}
                        </h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{notif.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{notif.message}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/mes-requetes/${notif.requete}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Voir la requête #{notif.requete}
                        </Link>
                        {!notif.lue && (
                          <button
                            onClick={() => markAsRead([notif.id])}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                          >
                            <Check size={12} />
                            Marquer comme lu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <StudentLayout>
      <NotificationsContent />
    </StudentLayout>
  );
}
