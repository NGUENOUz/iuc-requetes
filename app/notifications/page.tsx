'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell, CheckCircle, Clock, AlertTriangle, Info, Home,
  Check, Trash2, Filter, Eye, EyeOff, ArrowLeft, RefreshCw
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import AdminLayout from '../admin/layout';
import { useAuthStore } from '@/lib/store/auth.store';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllNotifications
} from '@/lib/hooks';
import toast from 'react-hot-toast';

const getNotificationType = (type?: string) => {
  if (!type) return 'info';
  const t = type.toLowerCase();
  if (t.includes('resolved') || t.includes('completed') || t.includes('success') || t.includes('validation')) {
    return 'success';
  }
  if (t.includes('warning') || t.includes('alert') || t.includes('rejected')) {
    return 'warning';
  }
  return 'info';
};

const typeConfig = {
  success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-600' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconColor: 'text-blue-600' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', iconColor: 'text-yellow-600' },
};

function NotificationsContent() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { user } = useAuthStore();
  const isStaff = user?.role?.name === 'admin' || user?.role?.name === 'agent';

  // Fetch notifications
  const { data: rawNotifications = [], isLoading, error } = useNotifications();

  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const deleteAllNotificationsMutation = useDeleteAllNotifications();

  // Formatting date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mapping from DB format to JSX format
  const mappedNotifications = rawNotifications.map((n: any) => ({
    id: n.id,
    type: getNotificationType(n.type),
    titre: n.title,
    message: n.message,
    link: n.link,
    date: formatDate(n.created_at),
    lue: n.is_read,
  }));

  const filtered = mappedNotifications.filter(n => {
    const matchType = typeFilter === 'all' || n.type === typeFilter;
    const matchRead = !showOnlyUnread || !n.lue;
    return matchType && matchRead;
  });

  const unreadCount = mappedNotifications.filter(n => !n.lue).length;

  const toggleSelect = (id: string) => {
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

  const markAsRead = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await markAsReadMutation.mutateAsync(id);
      }
      toast.success('Notification(s) marquée(s) comme lue(s)');
      setSelectedIds([]);
    } catch (err) {
      toast.error('Erreur lors du traitement');
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success('Toutes les notifications sont lues');
    } catch (err) {
      toast.error('Erreur lors du traitement');
    }
  };

  const deleteNotifications = async (ids: string[]) => {
    try {
      if (ids.length === mappedNotifications.length) {
        await deleteAllNotificationsMutation.mutateAsync();
        toast.success('Toutes les notifications ont été supprimées');
      } else {
        for (const id of ids) {
          await deleteNotificationMutation.mutateAsync(id);
        }
        toast.success('Notification(s) supprimée(s)');
      }
      setSelectedIds([]);
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const dashboardLink = isStaff ? '/admin' : '/dashboard';

  const typesConfigList = [
    { value: 'all', label: 'Toutes', count: mappedNotifications.length },
    { value: 'success', label: 'Traitées', count: mappedNotifications.filter(n => n.type === 'success').length },
    { value: 'info', label: 'Informations', count: mappedNotifications.filter(n => n.type === 'info').length },
    { value: 'warning', label: 'Alertes', count: mappedNotifications.filter(n => n.type === 'warning').length },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw size={36} className="text-emerald-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Chargement des notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
        <AlertTriangle size={32} className="mx-auto mb-2 text-red-500" />
        <p className="font-bold">Erreur de chargement</p>
        <p className="text-xs text-red-600 mt-1">Impossible de charger vos notifications</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href={dashboardLink} className="hover:text-emerald-600 transition-colors flex items-center gap-1">
          <Home size={14} />
          Tableau de bord
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Notifications</span>
      </div>

      {/* Bouton retour */}
      <Link
        href={dashboardLink}
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
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer disabled:opacity-50"
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
          {typesConfigList.map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                typeFilter === value
                  ? 'bg-emerald-600 text-white shadow-sm'
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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
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
                disabled={markAsReadMutation.isPending}
                onClick={() => markAsRead(selectedIds)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Eye size={14} />
                Marquer comme lu
              </button>
              <button
                disabled={deleteNotificationMutation.isPending || deleteAllNotificationsMutation.isPending}
                onClick={() => deleteNotifications(selectedIds)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
                Supprimer
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
            </div>
          )}

          {filtered.length > 0 && selectedIds.length === 0 && (
            <button
              onClick={selectAll}
              className="text-sm text-slate-600 hover:text-emerald-600 font-medium cursor-pointer"
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
            const config = typeConfig[notif.type as keyof typeof typeConfig] || typeConfig.info;
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
                        <h3 className={`font-bold text-slate-900 ${!notif.lue ? 'text-emerald-900 font-extrabold' : ''}`}>
                          {notif.titre}
                          {!notif.lue && (
                            <span className="ml-2 inline-block w-2 h-2 bg-emerald-500 rounded-full" />
                          )}
                        </h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{notif.date}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{notif.message}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {notif.link && (
                          <Link
                            href={notif.link}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            Consulter les détails
                          </Link>
                        )}
                        {!notif.lue && (
                          <button
                            disabled={markAsReadMutation.isPending}
                            onClick={() => markAsRead([notif.id])}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer disabled:opacity-50"
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
  const { user } = useAuthStore();
  const isStaff = user?.role?.name === 'admin' || user?.role?.name === 'agent';

  if (isStaff) {
    return (
      <AdminLayout>
        <NotificationsContent />
      </AdminLayout>
    );
  }

  return (
    <StudentLayout>
      <NotificationsContent />
    </StudentLayout>
  );
}
