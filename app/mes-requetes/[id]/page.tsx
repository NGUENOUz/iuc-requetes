'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  Printer,
  ExternalLink,
  MessageCircle,
  Send,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import { supabase } from '@/lib/supabase';
import { useStudent } from '@/lib/hooks';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';
import GlassCard from '@/components/ui/GlassCard';
import RequestTimeline, { TimelineStep } from '@/components/ui/RequestTimeline';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Skeleton from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function RequeteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;
  const router = useRouter();

  const { student } = useStudent();
  const [request, setRequest] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nouveauMessage, setNouveauMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  const fetchRequestDetails = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/requests/${requestId}`, {
        credentials: 'include',
        headers,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || 'Impossible de charger la requête');
      }

      setRequest(json.data);
    } catch (err: any) {
      console.error('Fetch request error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauMessage.trim() || sendingMsg) return;

    setSendingMsg(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`/api/requests/${requestId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          content: nouveauMessage.trim(),
          is_internal: false,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Erreur lors de l’envoi');

      toast.success('Message enregistré');
      setNouveauMessage('');
      fetchRequestDetails();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’envoi');
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="p-8 max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !request) {
    return (
      <StudentLayout>
        <div className="p-8 max-w-md mx-auto text-center space-y-4">
          <div className="w-12 h-12 bg-danger-bg text-danger-fg rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={22} />
          </div>
          <h2 className="text-lg font-bold text-fg">Dossier introuvable</h2>
          <p className="text-fg-muted text-xs">{error || 'Cette requête est introuvable.'}</p>
          <Link href="/mes-requetes">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Retour à la liste
            </Button>
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const statusName = request.status?.name || 'Soumise';
  const isResolved = statusName.toLowerCase().includes('résol');
  const isRejected =
    statusName.toLowerCase().includes('rejet') || statusName.toLowerCase().includes('refus');
  const isAutoResolved = request.metadata?.auto_resolved;
  const docCode = request.metadata?.document_code;

  // Étapes de la frise détaillée
  const detailedSteps: TimelineStep[] = [
    {
      id: '1',
      label: 'Demande déposée en ligne',
      date: new Date(request.submitted_at || request.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'completed',
    },
    {
      id: '2',
      label: isAutoResolved
        ? 'Certification numérique immédiate'
        : request.assigned_agent
        ? `Prise en charge par ${request.assigned_agent.first_name || 'l’agent'}`
        : 'Prise en charge par le service instructeur',
      date: isAutoResolved ? 'Traitement instantané' : undefined,
      status: isAutoResolved || isResolved || isRejected ? 'completed' : 'current',
    },
    {
      id: '3',
      label: isRejected ? 'Demande rejetée' : 'Délivrance et clôture du dossier',
      date: request.resolved_at
        ? new Date(request.resolved_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : undefined,
      status: isRejected ? 'rejected' : isResolved ? 'completed' : 'upcoming',
    },
  ];

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Navigation retour */}
        <div className="flex items-center justify-between text-xs text-fg-muted">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-fg transition-colors">
              Tableau de bord
            </Link>
            <span>/</span>
            <Link href="/mes-requetes" className="hover:text-fg transition-colors">
              Mes requêtes
            </Link>
            <span>/</span>
            <span className="font-mono text-fg font-semibold">{request.reference}</span>
          </div>

          <Link href="/mes-requetes">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>
              Retour
            </Button>
          </Link>
        </div>

        {/* Fiche d'identification en verre */}
        <GlassCard variant="glass" withShine={true} className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs text-fg-muted font-semibold">
                  {request.reference}
                </span>
                <StatusBadge
                  variant={isResolved ? 'success' : isRejected ? 'danger' : 'info'}
                >
                  {statusName}
                </StatusBadge>
                {isAutoResolved && (
                  <StatusBadge variant="info">Délivrance immédiate</StatusBadge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
                {request.title}
              </h1>
            </div>

            {docCode && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowDocModal(true)}
                  leftIcon={<Printer size={15} />}
                >
                  Voir l&apos;attestation certifiée
                </Button>
                <Link href={`/verify/${docCode}`} target="_blank">
                  <Button variant="secondary" size="sm" leftIcon={<ExternalLink size={14} />}>
                    Vérification QR
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-line/60 text-xs">
            <div>
              <p className="text-fg-muted mb-0.5">Catégorie</p>
              <p className="font-semibold text-fg">{request.category?.name || 'Général'}</p>
            </div>
            <div>
              <p className="text-fg-muted mb-0.5">Service en charge</p>
              <p className="font-semibold text-fg">{request.service?.name || 'Scolarité centrale'}</p>
            </div>
            <div>
              <p className="text-fg-muted mb-0.5">Priorité</p>
              <p className="font-semibold text-fg">{request.priority?.name || 'Normale'}</p>
            </div>
            <div>
              <p className="text-fg-muted mb-0.5">Date de dépôt</p>
              <p className="font-semibold text-fg tabular">
                {new Date(request.submitted_at || request.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* 2 Colonnes : Exposé & Échanges / Timeline verticale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche (2/3) : Exposé et messages */}
          <div className="lg:col-span-2 space-y-6">
            {/* Motif */}
            <GlassCard variant="solid" className="p-5 space-y-2">
              <h2 className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
                Motif exposé de la démarche
              </h2>
              <div className="p-3.5 rounded-lg bg-surface-muted/50 text-xs sm:text-sm text-fg leading-relaxed whitespace-pre-wrap">
                {request.description}
              </div>
            </GlassCard>

            {/* Échanges */}
            <GlassCard variant="glass" className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-line/60 pb-3">
                <h2 className="text-sm font-semibold text-fg flex items-center gap-1.5">
                  <MessageCircle size={16} />
                  Communications officielles ({request.comments?.length || 0})
                </h2>
                <span className="text-xs text-fg-muted">Messagerie académique</span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {!request.comments || request.comments.length === 0 ? (
                  <p className="text-xs text-fg-muted text-center py-6">
                    Aucun échange enregistré sur ce dossier.
                  </p>
                ) : (
                  request.comments.map((comment: any) => {
                    const isSystem = comment.is_system;
                    const isSelf = comment.user?.id === student?.id;

                    return (
                      <div
                        key={comment.id}
                        className={`p-3.5 rounded-lg text-xs leading-relaxed border transition-colors ${
                          isSystem
                            ? 'bg-accent-soft border-accent/20 text-fg'
                            : isSelf
                            ? 'bg-surface border-line ml-6 text-fg'
                            : 'bg-surface-raised border-line mr-6 text-fg'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-fg">
                            {isSystem
                              ? 'Notification automatique'
                              : `${comment.user?.first_name || ''} ${comment.user?.last_name || 'Administration'}`}
                          </span>
                          <span className="text-[10px] text-fg-muted tabular">
                            {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-fg-secondary">{comment.content}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Réponse */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-line/60 space-y-2">
                <Textarea
                  value={nouveauMessage}
                  onChange={(e) => setNouveauMessage(e.target.value)}
                  placeholder="Écrire un complément d’information ou poser une question..."
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={sendingMsg || !nouveauMessage.trim()}
                    isLoading={sendingMsg}
                    rightIcon={<Send size={13} />}
                  >
                    Envoyer
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>

          {/* Colonne droite (1/3) : Frise d'instruction verticale détaillée */}
          <div className="space-y-6">
            <GlassCard variant="glass" withShine={true} className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-fg">
                Progression du dossier
              </h3>
              <RequestTimeline
                variant="detailed"
                steps={detailedSteps}
                isRejected={isRejected}
                statusSentence={
                  isResolved
                    ? 'Démarche clôturée avec succès.'
                    : isRejected
                    ? 'Décision défavorable. Vous pouvez contacter la scolarité.'
                    : 'Instruction en cours par les équipes administratives.'
                }
              />
            </GlassCard>

            {/* Agent / Service */}
            <GlassCard variant="solid" className="p-5 space-y-3">
              <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
                Service assigné
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-fg-muted">Service instructeur</p>
                  <p className="font-semibold text-fg mt-0.5">
                    {request.service?.name || 'Scolarité centrale'}
                  </p>
                </div>
                <div>
                  <p className="text-fg-muted">Gestionnaire de dossier</p>
                  <p className="font-semibold text-fg mt-0.5">
                    {isAutoResolved
                      ? 'Automatisé (Certification numérique)'
                      : request.assigned_agent
                      ? `${request.assigned_agent.first_name} ${request.assigned_agent.last_name}`
                      : 'En cours d’attribution'}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Modal attestation */}
      {docCode && (
        <OfficialDocumentModal
          isOpen={showDocModal}
          onClose={() => setShowDocModal(false)}
          document={{
            type: 'attestation',
            title: request.title,
            code: docCode,
            date: new Date(request.resolved_at || request.submitted_at || request.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            requesterName: `${request.student?.first_name || student?.first_name} ${request.student?.last_name || student?.last_name}`,
            matricule: request.student?.matricule || student?.matricule || 'N/A',
            programOrFunction: `${request.student?.filiere || student?.filiere || 'Génie Logiciel'} (${request.student?.niveau || student?.niveau || 'L3'})`,
            academicYear: request.student?.annee_academique || student?.annee_academique || '2025-2026',
          }}
        />
      )}
    </StudentLayout>
  );
}
