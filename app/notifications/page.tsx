'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  Trash2,
  Eye,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import AdminLayout from '../admin/layout';
import { useAuthStore } from '@/lib/store/auth.store';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from '@/lib/hooks';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

const getNotificationType = (type?: string) => {
  if (!type) return 'info';
  const t = type.toLowerCase();
  if (
    t.includes('resolved') ||
    t.includes('completed') ||
    t.includes('success') ||
    t.includes('validation')
  ) {
    return 'success';
  }
  if (t.includes('warning') || t.includes('alert') || t.includes('rejected')) {
    return 'warning';
  }
  return 'info';
};

function NotificationsContent() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { user } = useAuthStore();
  const isStaff = user?.role?.name === 'admin' || user?.role?.name === 'agent';

  const { data: rawNotifications = [], isLoading, error } = useNotifications();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const deleteAllNotificationsMutation = useDeleteAllNotifications();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const mappedNotifications = rawNotifications.map((n: any) => ({
    id: n.id,
    type: getNotificationType(n.type),
    titre: n.title,
    message: n.message,
    link: n.link,
    date: formatDate(n.created_at),
    lue: n.is_read,
  }));

  const filtered = mappedNotifications.filter((n) => {
    const matchType = typeFilter === 'all' || n.type === typeFilter;
    const matchRead = !showOnlyUnread || !n.lue;
    return matchType && matchRead;
  });

  const unreadCount = mappedNotifications.filter((n) => !n.lue).length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(filtered.map((n) => n.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const markAsRead = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await markAsReadMutation.mutateAsync(id);
      }
      toast.success('Notification marquée comme lue');
      setSelectedIds([]);
    } catch {
      toast.error('Erreur lors du traitement');
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success('Toutes les notifications sont lues');
    } catch {
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
        toast.success('Notification supprimée');
      }
      setSelectedIds([]);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const dashboardLink = isStaff ? '/admin' : '/dashboard';

  const typesConfigList = [
    { value: 'all', label: 'Toutes', count: mappedNotifications.length },
    {
      value: 'success',
      label: 'Traitées',
      count: mappedNotifications.filter((n) => n.type === 'success').length,
    },
    {
      value: 'info',
      label: 'Informations',
      count: mappedNotifications.filter((n) => n.type === 'info').length,
    },
    {
      value: 'warning',
      label: 'Alertes',
      count: mappedNotifications.filter((n) => n.type === 'warning').length,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 size={32} className="text-accent animate-spin" />
        <p className="text-xs text-fg-muted font-medium">Chargement des notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-danger-bg text-danger-fg text-center max-w-md mx-auto my-12 space-y-2">
        <AlertTriangle size={24} className="mx-auto" />
        <p className="font-semibold text-sm">Impossible de charger les notifications</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-line">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
              Notifications & alertes
            </h1>
            {unreadCount > 0 && (
              <span className="bg-accent text-accent-fg text-xs font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-fg-muted">
            Suivi des mises à jour sur tes démarches et cours universitaires.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllAsRead} leftIcon={<Check size={14} />}>
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Filtres par type */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-surface-muted/60 border border-line text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {typesConfigList.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTypeFilter(t.value)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors-fast cursor-pointer whitespace-nowrap ${
                typeFilter === t.value
                  ? 'bg-surface text-fg font-semibold shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-fg-secondary">
          <input
            type="checkbox"
            checked={showOnlyUnread}
            onChange={(e) => setShowOnlyUnread(e.target.checked)}
            className="rounded"
          />
          <span>Non lues uniquement</span>
        </label>
      </div>

      {/* Liste des notifications */}
      {filtered.length === 0 ? (
        <GlassCard>
          <EmptyState
            title="Aucune notification"
            description="Tu es à jour ! Toutes tes notifications ont été consultées."
          />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const isUnread = !n.lue;

            return (
              <GlassCard
                key={n.id}
                variant="glass"
                className={`p-4 sm:p-5 transition-colors ${
                  isUnread ? 'border-accent/40 bg-accent-soft/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge
                        variant={
                          n.type === 'success'
                            ? 'success'
                            : n.type === 'warning'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {n.type === 'success' ? 'Résolue' : n.type === 'warning' ? 'Alerte' : 'Info'}
                      </StatusBadge>
                      <span className="text-[11px] text-fg-muted tabular font-mono">
                        {n.date}
                      </span>
                    </div>

                    <p className={`text-sm ${isUnread ? 'font-bold text-fg' : 'font-medium text-fg'}`}>
                      {n.titre}
                    </p>

                    <p className="text-xs text-fg-secondary leading-relaxed">
                      {n.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead([n.id])}
                        title="Marquer comme lue"
                      >
                        <Check size={14} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotifications([n.id])}
                      className="text-fg-muted hover:text-danger-fg"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {n.link && (
                  <div className="mt-2 pt-2 border-t border-line/60">
                    <Link
                      href={n.link}
                      className="text-xs text-accent hover:underline font-medium"
                    >
                      Consulter le dossier associé →
                    </Link>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
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
