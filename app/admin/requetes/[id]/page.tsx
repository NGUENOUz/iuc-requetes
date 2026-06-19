'use client';

import {
  ArrowLeft, Clock, CheckCircle, XCircle, RefreshCw, AlertCircle,
  User, Building2, Tag, Calendar, MessageSquare, Send,
  Paperclip, ChevronRight, UserCog, Zap, FileText,
  CheckCircle2, Ban, RotateCcw, Edit3, Phone, Mail,
  Search, X,
} from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useRequest, useStatuses, useAssignableUsers } from '@/lib/hooks';
import toast from 'react-hot-toast';

const statutStyle: Record<string, string> = {
  'Soumise':    'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  'En attente': 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  'Assignée':   'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
  'En cours':   'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  'En attente d\'information': 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  'Résolue':    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  'Rejetée':    'bg-red-100 text-red-700 ring-1 ring-red-200',
  'Fermée':     'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

const prioriteStyle: Record<string, string> = {
  'Critique': 'bg-red-50 text-red-700 ring-1 ring-red-200',
  'Haute':    'bg-red-50 text-red-600 ring-1 ring-red-200',
  'Moyenne':  'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  'Basse':    'bg-slate-100 text-slate-500',
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'Résolue':    return <CheckCircle size={11} />;
    case 'Rejetée':    return <XCircle size={11} />;
    case 'En cours':   return <RefreshCw size={11} />;
    case 'Assignée':   return <UserCog size={11} />;
    case 'En attente': return <Clock size={11} />;
    default:           return <AlertCircle size={11} />;
  }
};

const getHistoryIcon = (action: string) => {
  switch (action) {
    case 'request_created':
      return <FileText size={13} />;
    case 'assigned':
      return <UserCog size={13} />;
    case 'status_changed':
      return <RefreshCw size={13} />;
    case 'comment_added':
      return <MessageSquare size={13} />;
    default:
      return <FileText size={13} />;
  }
};

const getHistoryColorClass = (action: string) => {
  switch (action) {
    case 'request_created':
      return 'bg-blue-100 text-blue-600';
    case 'assigned':
      return 'bg-violet-100 text-violet-600';
    case 'status_changed':
      return 'bg-yellow-100 text-yellow-600';
    case 'comment_added':
      return 'bg-emerald-100 text-emerald-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

export default function AdminRequeteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [commentaire, setCommentaire] = useState('');

  // Fetch live request detail and statuses
  const { data: request, isLoading, error } = useRequest(id);
  const { data: statuses = [] } = useStatuses();

  // Status variables
  const statusResolved = statuses.find((s: any) => s.name === 'Résolue');
  const statusRejected = statuses.find((s: any) => s.name === 'Rejetée');
  const statusInProgress = statuses.find((s: any) => s.name === 'En cours');
  const statusPending = statuses.find((s: any) => s.name === 'En attente');

  // Mutation for updating status (uses the dedicated /status endpoint for history + notifications)
  const updateStatusMutation = useMutation({
    mutationFn: async (statusId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/requests/${id}/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status_id: statusId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || 'Erreur lors du changement de statut');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'requests'] });
    },
  });

  // Mutation for adding a comment
  const postCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/requests/${id}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content,
          is_internal: true, // internal comments
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du commentaire');
      }
      return response.json();
    },
    onSuccess: () => {
      setCommentaire('');
      queryClient.invalidateQueries({ queryKey: ['request', id] });
    },
  });

  const handleAction = (action: string) => {
    let targetStatusId = '';
    if (action === 'valider') targetStatusId = statusResolved?.id || '';
    else if (action === 'rejeter') targetStatusId = statusRejected?.id || '';
    else if (action === 'traiter') targetStatusId = statusInProgress?.id || '';
    else if (action === 'attente') targetStatusId = statusPending?.id || '';
    
    if (targetStatusId) {
      updateStatusMutation.mutate(targetStatusId);
    }
  };

  const handleSendComment = () => {
    if (!commentaire.trim() || postCommentMutation.isPending) return;
    postCommentMutation.mutate(commentaire);
  };

  const getSlaRestant = (dueDateStr?: string) => {
    if (!dueDateStr) return 'Non défini';
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    if (diffMs < 0) return 'SLA Dépassé';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 24) {
      return `${diffHrs} heures`;
    }
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} jours`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

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

  // Loading Screen
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6 animate-pulse max-w-[1400px]">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-200 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
          </div>
        </div>
        <div className="h-10 bg-slate-100 rounded-xl w-1/2"></div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 h-96 bg-slate-50 rounded-2xl border border-slate-100"></div>
          <div className="h-96 bg-slate-50 rounded-2xl border border-slate-100"></div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-6 text-center text-red-500">
        <AlertCircle className="mx-auto mb-2" />
        <p className="font-semibold">Erreur de chargement de la requête</p>
        <p className="text-xs text-slate-400 mt-1">{error?.message || 'La requête n\'existe pas'}</p>
        <Link href="/admin/requetes" className="mt-4 inline-block text-sm text-emerald-600 font-semibold hover:underline">
          Retour aux requêtes
        </Link>
      </div>
    );
  }

  const comments = request.comments || [];
  const history = request.history || [];
  const attachments = request.attachments || [];

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px]">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/requetes"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900">{request.reference}</h1>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg ${statutStyle[request.status?.name] || 'bg-slate-100'}`}>
                {getStatusIcon(request.status?.name)}
                {request.status?.name}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${prioriteStyle[request.priority?.name] || 'bg-slate-100'}`}>
                {request.priority?.name === 'Critique' || request.priority?.name === 'Haute' ? '🔴 ' : request.priority?.name === 'Normale' ? '🟡 ' : '🟢 '}
                Priorité {request.priority?.name || 'Normale'}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <Calendar size={11} />
              Soumise le {formatDate(request.submitted_at)} {request.updated_at && `· Mise à jour le ${formatDate(request.updated_at)}`}
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Link href="/admin" className="hover:text-emerald-600 transition-colors">Tableau de bord</Link>
          <ChevronRight size={12} />
          <Link href="/admin/requetes" className="hover:text-emerald-600 transition-colors">Requêtes</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-semibold">{request.reference}</span>
        </div>
      </div>

      {/* ── Boutons d'action ── */}
      <div className="flex flex-wrap gap-2">
        {request.status?.name !== 'Résolue' && statusResolved && (
          <button
            onClick={() => handleAction('valider')}
            disabled={updateStatusMutation.isPending}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer disabled:bg-emerald-400"
          >
            <CheckCircle2 size={14} /> Valider & Résoudre
          </button>
        )}
        {request.status?.name !== 'Rejetée' && statusRejected && (
          <button
            onClick={() => handleAction('rejeter')}
            disabled={updateStatusMutation.isPending}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-500/20 cursor-pointer disabled:bg-red-400"
          >
            <Ban size={14} /> Rejeter
          </button>
        )}
        {request.status?.name !== 'En cours' && statusInProgress && (
          <button
            onClick={() => handleAction('traiter')}
            disabled={updateStatusMutation.isPending}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> Mettre en cours
          </button>
        )}
        {request.status?.name !== 'En attente' && statusPending && (
          <button
            onClick={() => handleAction('attente')}
            disabled={updateStatusMutation.isPending}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw size={14} /> Remettre en attente
          </button>
        )}
      </div>

      {/* ── Contenu principal ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Colonne gauche (2/3) ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Détails de la requête */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileText size={16} className="text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-900">{request.title}</h2>
            </div>

            {/* Infos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              {[
                { icon: Tag, label: 'Catégorie', value: request.category?.name || 'Général', color: 'text-violet-600 bg-violet-50' },
                { icon: Building2, label: 'Service', value: request.service?.name || 'Non assigné', color: 'text-blue-600 bg-blue-50' },
                { icon: AlertCircle, label: 'SLA restant', value: getSlaRestant(request.due_date), color: 'text-orange-600 bg-orange-50' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                    <Icon size={13} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Description de la requête</p>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line border border-slate-100">
                {request.description}
              </div>
            </div>

            {/* Pièces jointes */}
            {attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Pièces jointes ({attachments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((pj: any) => (
                    <a
                      key={pj.id}
                      href={pj.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs hover:bg-slate-50 hover:border-emerald-300 transition-all group cursor-pointer"
                    >
                      <Paperclip size={13} className="text-slate-400 group-hover:text-emerald-600" />
                      <span className="font-semibold text-slate-700">{pj.file_name}</span>
                      <span className="text-slate-400">{formatFileSize(pj.file_size)}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Historique */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                <Clock size={16} className="text-blue-600" />
              </div>
              <h2 className="font-bold text-slate-900">Historique de la requête</h2>
            </div>
            <div className="space-y-0">
              {history.map((h: any, i: number) => (
                <div key={h.id} className="flex gap-3 relative">
                  {/* Ligne verticale */}
                  {i < history.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-100" />
                  )}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 ${getHistoryColorClass(h.action)}`}>
                    {getHistoryIcon(h.action)}
                  </div>
                  <div className="flex-1 pb-5">
                    <p className="text-sm font-semibold text-slate-800">{h.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-slate-500">
                        {h.user ? `${h.user.first_name} ${h.user.last_name}` : 'Système'}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(h.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commentaires */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <MessageSquare size={16} className="text-violet-600" />
              </div>
              <h2 className="font-bold text-slate-900">Commentaires internes</h2>
              <span className="ml-auto bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {comments.length}
              </span>
            </div>

            {/* Liste commentaires */}
            <div className="space-y-4 mb-4">
              {comments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {c.user ? `${c.user.first_name?.[0] || ''}${c.user.last_name?.[0] || ''}`.toUpperCase().slice(0, 2) : 'U'}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-800">
                        {c.user ? `${c.user.first_name} ${c.user.last_name}` : 'Utilisateur'}
                      </span>
                      {c.is_internal && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">Interne</span>
                      )}
                      <span className="text-[10px] text-slate-400 ml-auto">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Zone de saisie */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-700 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                AD
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Ajouter un commentaire interne..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 transition-all resize-none"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!commentaire.trim() || postCommentMutation.isPending}
                  className="absolute bottom-3 right-3 w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Colonne droite (1/3) ── */}
        <div className="space-y-4">

          {/* Étudiant */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <User size={16} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900">Étudiant</h3>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white text-sm font-black flex items-center justify-center shrink-0">
                {request.student ? `${request.student.first_name?.[0] || ''}${request.student.last_name?.[0] || ''}`.toUpperCase().slice(0, 2) : '?'}
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {request.student ? `${request.student.first_name} ${request.student.last_name}` : 'Inconnu'}
                </p>
                <p className="text-xs text-slate-500 font-mono">{request.student?.matricule || 'Sans matricule'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{request.student?.filiere || 'Filière non définie'}</p>
              </div>
            </div>
            <div className="space-y-2">
              {request.student?.email && (
                <a href={`mailto:${request.student.email}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-emerald-600 transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                    <Mail size={13} className="text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <span className="truncate">{request.student.email}</span>
                </a>
              )}
              {request.student?.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Phone size={13} className="text-slate-400" />
                  </div>
                  <span>{request.student.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent assigné */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <UserCog size={16} className="text-violet-600" />
              </div>
              <h3 className="font-bold text-slate-900">Agent assigné</h3>
            </div>
            {request.assigned_agent ? (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                  {`${request.assigned_agent.first_name?.[0] || ''}${request.assigned_agent.last_name?.[0] || ''}`.toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">
                    {request.assigned_agent.first_name} {request.assigned_agent.last_name}
                  </p>
                  <p className="text-xs text-slate-500">{request.assigned_agent.fonction || 'Agent'}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic mb-4">Aucun agent n&apos;est assigné à cette requête.</p>
            )}
            <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-xl transition-colors cursor-pointer">
              <UserCog size={13} /> Réassigner
            </button>
          </div>

          {/* Méta-infos */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Informations</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Référence', value: request.reference, mono: true },
                { label: 'Date de création', value: formatDate(request.submitted_at) },
                { label: 'Dernière modification', value: formatDate(request.updated_at) },
                { label: 'SLA restant', value: getSlaRestant(request.due_date) },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-xs text-slate-400 font-medium">{label}</span>
                  <span className={`text-xs font-bold text-slate-700 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
