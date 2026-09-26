'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Clock, CheckCircle, XCircle, Calendar,
  User, MessageCircle, Send, AlertCircle,
  ShieldCheck, Printer, ExternalLink, Zap, Loader2, Sparkles
} from 'lucide-react';
import StudentLayout from '../../components/StudentLayout';
import { supabase } from '@/lib/supabase';
import { useStudent } from '@/lib/hooks';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';
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
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch(`/api/requests/${requestId}`, { credentials: 'include', headers });
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
      const { data: { session } } = await supabase.auth.getSession();
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
      if (!res.ok) throw new Error(json.error?.message || 'Erreur d\'envoi');

      toast.success('Message enregistré');
      setNouveauMessage('');
      fetchRequestDetails();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-950 mx-auto mb-3" />
            <p className="text-zinc-500 text-xs font-mono">Chargement du dossier...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !request) {
    return (
      <StudentLayout>
        <div className="p-8 max-w-md mx-auto text-center space-y-4">
          <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">Dossier introuvable</h2>
          <p className="text-zinc-500 text-xs">{error || 'Cette requête est introuvable.'}</p>
          <Link
            href="/mes-requetes"
            className="inline-flex items-center gap-2 bg-black text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={13} /> Retour à la liste
          </Link>
        </div>
      </StudentLayout>
    );
  }

  const statusName = request.status?.name || 'Soumise';
  const isResolved = statusName === 'Résolue';
  const isAutoResolved = request.metadata?.auto_resolved;
  const docCode = request.metadata?.document_code;

  return (
    <StudentLayout>
      <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
        
        {/* Navigation fil d'Ariane */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="hover:text-black transition-colors">
              Tableau de bord
            </Link>
            <span>/</span>
            <Link href="/mes-requetes" className="hover:text-black transition-colors">
              Requêtes
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-bold font-mono">{request.reference}</span>
          </div>

          <Link
            href="/mes-requetes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={13} />
            Retour
          </Link>
        </div>

        {/* Fiche d'identification du ticket */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="font-mono font-bold text-xs bg-zinc-100 text-zinc-900 px-2.5 py-0.5 rounded border border-zinc-200">
                  {request.reference}
                </span>
                <span className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                  isResolved
                    ? 'bg-black text-white border-black'
                    : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                }`}>
                  {statusName}
                </span>
                {isAutoResolved && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-zinc-100 text-zinc-900 border border-zinc-300 px-2 py-0.5 rounded font-bold">
                    <Zap size={11} /> Auto-Résolu
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
                {request.title}
              </h1>
            </div>

            {/* Actions rapides certificat */}
            {docCode && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(true)}
                  className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-2xs"
                >
                  <Printer size={14} />
                  Consulter l'attestation certifiée
                </button>
                <Link
                  href={`/verify/${docCode}`}
                  target="_blank"
                  className="flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 font-semibold text-xs px-3 py-2.5 rounded-lg transition-colors"
                >
                  <ExternalLink size={13} />
                  Contrôle QR
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 text-xs">
            <div>
              <p className="font-mono text-[10px] uppercase text-zinc-400 font-semibold mb-1">Catégorie</p>
              <p className="font-bold text-zinc-900">{request.category?.name || 'Général'}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-zinc-400 font-semibold mb-1">Service instructeur</p>
              <p className="font-bold text-zinc-900">{request.service?.name || 'Scolarité Centrale'}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-zinc-400 font-semibold mb-1">Priorité</p>
              <p className="font-bold text-zinc-900">{request.priority?.name || 'Normale'}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-zinc-400 font-semibold mb-1">Date de soumission</p>
              <p className="font-bold text-zinc-900 font-mono">
                {new Date(request.submitted_at || request.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Bannière de certification si disponible */}
        {docCode && (
          <div className="bg-[#09090b] text-white rounded-xl p-5 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 text-white flex items-center justify-center shrink-0 border border-zinc-700">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-bold font-mono uppercase text-zinc-200">
                  Document Officiel Délivré Numériquement • {docCode}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Validé et certifié conforme par la Direction des Études de l'Institut Universitaire de la Côte.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDocModal(true)}
              className="px-4 py-2 bg-white text-black hover:bg-zinc-200 font-bold text-xs rounded-lg transition-colors shrink-0"
            >
              Afficher le document A4
            </button>
          </div>
        )}

        {/* Disposition 2 Colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne gauche (2/3) : Motif & Échanges */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description du requérant */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                Exposé initial de la requête
              </h2>
              <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-4 text-xs sm:text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap font-sans">
                {request.description}
              </div>
            </div>

            {/* Fil d'échanges */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                  <MessageCircle size={15} />
                  Communications & Échanges ({request.comments?.length || 0})
                </h2>
                <span className="text-[10px] font-mono text-zinc-400">Canal interne</span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {(!request.comments || request.comments.length === 0) ? (
                  <p className="text-xs text-zinc-400 text-center py-6">
                    Aucun échange enregistré sur ce ticket.
                  </p>
                ) : (
                  request.comments.map((comment: any) => {
                    const isSystem = comment.is_system;
                    const isSelf = comment.user?.id === student?.id;

                    return (
                      <div
                        key={comment.id}
                        className={`p-3.5 rounded-lg text-xs leading-relaxed border ${
                          isSystem
                            ? 'bg-[#09090b] text-white border-zinc-800'
                            : isSelf
                            ? 'bg-zinc-50 border-zinc-200 ml-6 text-zinc-900'
                            : 'bg-white border-zinc-200 mr-6 text-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {isSystem ? (
                              <Sparkles size={13} className="text-white" />
                            ) : (
                              <User size={13} className="text-zinc-500" />
                            )}
                            <span className="font-bold">
                              {isSystem
                                ? 'Système Automatisé IUC'
                                : `${comment.user?.first_name || ''} ${comment.user?.last_name || 'Administration'}`}
                            </span>
                            {comment.user?.role?.name && !isSystem && (
                              <span className="text-[9px] font-mono uppercase bg-zinc-200 px-1.5 py-0.2 rounded text-zinc-700">
                                {comment.user.role.name}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-mono ${isSystem ? 'text-zinc-400' : 'text-zinc-400'}`}>
                            {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <p className={isSystem ? 'text-zinc-300' : 'text-zinc-700'}>
                          {comment.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Formulaire de réponse */}
              <form onSubmit={handleSendMessage} className="pt-2 border-t border-zinc-100 space-y-2.5">
                <textarea
                  value={nouveauMessage}
                  onChange={(e) => setNouveauMessage(e.target.value)}
                  placeholder="Écrire un complément d'information ou poser une question..."
                  rows={2}
                  className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-black resize-none transition-all"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingMsg || !nouveauMessage.trim()}
                    className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    {sendingMsg ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    Envoyer
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Colonne droite (1/3) : Instruction & Historique */}
          <div className="space-y-6">
            
            {/* Prise en charge */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                Instruction du dossier
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase">Service en charge</p>
                  <p className="font-bold text-zinc-900 mt-0.5">{request.service?.name || 'Scolarité Centrale'}</p>
                </div>

                <div>
                  <p className="text-zinc-400 font-mono text-[10px] uppercase">Agent instructeur</p>
                  {isAutoResolved ? (
                    <div className="mt-1 p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 font-bold text-xs flex items-center gap-1.5">
                      <Zap size={14} className="text-black" />
                      Génération Numérique Instantanée
                    </div>
                  ) : request.assigned_agent ? (
                    <div className="mt-1 p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                      <p className="font-bold text-zinc-900">
                        {request.assigned_agent.first_name} {request.assigned_agent.last_name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {request.assigned_agent.fonction || 'Agent instructeur'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic mt-0.5">En cours d'attribution...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline des événements */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Clock size={14} />
                Journal d'audit
              </h3>

              <div className="space-y-3 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 pl-5">
                {(request.history || []).map((h: any, idx: number) => (
                  <div key={h.id || idx} className="relative">
                    <div className="absolute -left-5 top-1 w-2 h-2 rounded-full bg-black border border-white" />
                    <p className="text-[10px] font-mono text-zinc-400">
                      {new Date(h.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs font-semibold text-zinc-800 mt-0.5">
                      {h.description || h.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modal du document certifié */}
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
            programOrFunction:
              student?.role_code === 'enseignant'
                ? (student?.fonction || 'Enseignant - IUC')
                : student?.role_code === 'personnel'
                ? (student?.fonction || 'Personnel Administratif')
                : `${request.student?.filiere || student?.filiere || 'Génie Logiciel'} (${request.student?.niveau || student?.niveau || 'L3'})`,
            academicYear: request.student?.annee_academique || student?.annee_academique || '2025-2026',
          }}
        />
      )}
    </StudentLayout>
  );
}
