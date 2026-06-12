'use client';

import {
  ArrowLeft, Clock, CheckCircle, XCircle, RefreshCw, AlertCircle,
  User, Building2, Tag, Calendar, MessageSquare, Send,
  Paperclip, ChevronRight, UserCog, Zap, FileText,
  CheckCircle2, Ban, RotateCcw, Edit3, Phone, Mail,
} from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const REQUETE = {
  id: 'REQ-1248',
  categorie: 'Réclamation de note',
  service: 'Scolarité',
  statut: 'En cours',
  priorite: 'Haute',
  dateCreation: '19 mai 2025 à 09:32',
  dateMiseAJour: '19 mai 2025 à 14:15',
  delaiRestant: '2 jours',
  description: `Bonjour,

Je me permets de vous contacter concernant ma note obtenue à l'examen de Mathématiques Avancées du semestre 4. En consultant mes résultats, j'ai constaté une note de 08/20 alors que selon mes calculs et les corrections effectuées en classe, ma note devrait être bien supérieure.

J'ai bien vérifié mon copie lors de la séance de consultation et j'ai relevé plusieurs erreurs de correction notamment à la question 3 (exercice sur les intégrales) où j'avais la bonne méthode mais aucun point n'a été accordé.

Je sollicite respectueusement une révision de ma copie par le responsable pédagogique.

Cordialement,
NGUENOU Wilfried`,
  etudiant: {
    nom: 'NGUENOU Wilfried',
    matricule: 'IUC2021001',
    filiere: 'Génie Logiciel – L3',
    email: 'w.nguenou@iuc.univ-cm.net',
    telephone: '+237 691 234 567',
    avatar: 'NW',
  },
  agent: {
    nom: 'M. TAMBA Eric',
    role: 'Agent Scolarité',
    avatar: 'TE',
  },
  pieceJointes: [
    { nom: 'copie_examen.pdf', taille: '2.3 MB', type: 'pdf' },
    { nom: 'relevé_notes.pdf', taille: '0.8 MB', type: 'pdf' },
  ],
  historique: [
    { date: '19 mai 2025, 09:32', auteur: 'NGUENOU Wilfried', role: 'Étudiant', action: 'Requête soumise', icon: 'create', color: 'bg-blue-100 text-blue-600' },
    { date: '19 mai 2025, 10:05', auteur: 'Système', role: 'Automatique', action: 'Requête assignée à M. TAMBA Eric', icon: 'assign', color: 'bg-violet-100 text-violet-600' },
    { date: '19 mai 2025, 11:30', auteur: 'M. TAMBA Eric', role: 'Agent Scolarité', action: 'Prise en charge de la requête — En cours de traitement', icon: 'progress', color: 'bg-yellow-100 text-yellow-600' },
    { date: '19 mai 2025, 14:15', auteur: 'M. TAMBA Eric', role: 'Agent Scolarité', action: 'Transmission au responsable pédagogique pour révision', icon: 'send', color: 'bg-emerald-100 text-emerald-600' },
  ],
  commentaires: [
    { auteur: 'M. TAMBA Eric', role: 'Agent Scolarité', avatar: 'TE', date: '19 mai 2025, 14:15', texte: 'Dossier transmis au département de Génie Logiciel pour vérification de la copie. Délai de réponse estimé : 48h.' },
  ],
};

/* ═══════════════════════ STYLES ═══════════════════════ */

const statutStyle: Record<string, string> = {
  'En attente': 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  'En cours':   'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  'Résolue':    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  'Rejetée':    'bg-red-100 text-red-700 ring-1 ring-red-200',
};
const prioriteStyle: Record<string, string> = {
  'Haute':   'bg-red-50 text-red-600 ring-1 ring-red-200',
  'Moyenne': 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  'Basse':   'bg-slate-100 text-slate-500',
};
const histIcon: Record<string, React.ReactNode> = {
  create:   <FileText size={13} />,
  assign:   <UserCog size={13} />,
  progress: <RefreshCw size={13} />,
  send:     <Send size={13} />,
};

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminRequeteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [commentaire, setCommentaire] = useState('');
  const [statutLocal, setStatutLocal] = useState(REQUETE.statut);

  const handleAction = (action: string) => {
    const map: Record<string, string> = {
      valider: 'Résolue',
      rejeter: 'Rejetée',
      traiter: 'En cours',
      attente: 'En attente',
    };
    if (map[action]) setStatutLocal(map[action]);
  };

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
              <h1 className="text-xl font-black text-slate-900">#{REQUETE.id}</h1>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg ${statutStyle[statutLocal]}`}>
                {statutLocal === 'En cours' && <RefreshCw size={11} />}
                {statutLocal === 'En attente' && <Clock size={11} />}
                {statutLocal === 'Résolue' && <CheckCircle size={11} />}
                {statutLocal === 'Rejetée' && <XCircle size={11} />}
                {statutLocal}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${prioriteStyle[REQUETE.priorite]}`}>
                {REQUETE.priorite === 'Haute' && '🔴 '}{REQUETE.priorite === 'Moyenne' && '🟡 '}{REQUETE.priorite === 'Basse' && '🟢 '}
                Priorité {REQUETE.priorite}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <Calendar size={11} />
              Soumise le {REQUETE.dateCreation} · Mise à jour le {REQUETE.dateMiseAJour}
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Link href="/admin" className="hover:text-emerald-600 transition-colors">Tableau de bord</Link>
          <ChevronRight size={12} />
          <Link href="/admin/requetes" className="hover:text-emerald-600 transition-colors">Requêtes</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-semibold">#{REQUETE.id}</span>
        </div>
      </div>

      {/* ── Boutons d'action ── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAction('valider')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20"
        >
          <CheckCircle2 size={14} /> Valider & Résoudre
        </button>
        <button
          onClick={() => handleAction('rejeter')}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-500/20"
        >
          <Ban size={14} /> Rejeter
        </button>
        <button
          onClick={() => handleAction('traiter')}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <RefreshCw size={14} /> Mettre en cours
        </button>
        <button
          onClick={() => handleAction('attente')}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <RotateCcw size={14} /> Remettre en attente
        </button>
        <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors border border-slate-200 shadow-sm ml-auto">
          <Edit3 size={14} /> Modifier
        </button>
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
              <h2 className="font-bold text-slate-900">Détails de la requête</h2>
            </div>

            {/* Infos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              {[
                { icon: Tag, label: 'Catégorie', value: REQUETE.categorie, color: 'text-violet-600 bg-violet-50' },
                { icon: Building2, label: 'Service', value: REQUETE.service, color: 'text-blue-600 bg-blue-50' },
                { icon: AlertCircle, label: 'SLA restant', value: REQUETE.delaiRestant, color: 'text-orange-600 bg-orange-50' },
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
                {REQUETE.description}
              </div>
            </div>

            {/* Pièces jointes */}
            {REQUETE.pieceJointes.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Pièces jointes ({REQUETE.pieceJointes.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {REQUETE.pieceJointes.map((pj) => (
                    <button
                      key={pj.nom}
                      className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs hover:bg-slate-50 hover:border-emerald-300 transition-all group"
                    >
                      <Paperclip size={13} className="text-slate-400 group-hover:text-emerald-600" />
                      <span className="font-semibold text-slate-700">{pj.nom}</span>
                      <span className="text-slate-400">{pj.taille}</span>
                    </button>
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
              {REQUETE.historique.map((h, i) => (
                <div key={i} className="flex gap-3 relative">
                  {/* Ligne verticale */}
                  {i < REQUETE.historique.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-100" />
                  )}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 ${h.color}`}>
                    {histIcon[h.icon]}
                  </div>
                  <div className="flex-1 pb-5">
                    <p className="text-sm font-semibold text-slate-800">{h.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-slate-500">{h.auteur}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{h.role}</span>
                      <span className="text-[10px] text-slate-400">{h.date}</span>
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
                {REQUETE.commentaires.length}
              </span>
            </div>

            {/* Liste commentaires */}
            <div className="space-y-4 mb-4">
              {REQUETE.commentaires.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                    {c.avatar}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-800">{c.auteur}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">{c.role}</span>
                      <span className="text-[10px] text-slate-400 ml-auto">{c.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.texte}</p>
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
                  disabled={!commentaire.trim()}
                  className="absolute bottom-3 right-3 w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
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
                {REQUETE.etudiant.avatar}
              </div>
              <div>
                <p className="font-bold text-slate-900">{REQUETE.etudiant.nom}</p>
                <p className="text-xs text-slate-500 font-mono">{REQUETE.etudiant.matricule}</p>
                <p className="text-xs text-slate-400 mt-0.5">{REQUETE.etudiant.filiere}</p>
              </div>
            </div>
            <div className="space-y-2">
              <a href={`mailto:${REQUETE.etudiant.email}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-emerald-600 transition-colors group">
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
                  <Mail size={13} className="text-slate-400 group-hover:text-emerald-600" />
                </div>
                <span className="truncate">{REQUETE.etudiant.email}</span>
              </a>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Phone size={13} className="text-slate-400" />
                </div>
                <span>{REQUETE.etudiant.telephone}</span>
              </div>
            </div>
            <button className="mt-4 w-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors">
              Voir le profil complet →
            </button>
          </div>

          {/* Agent assigné */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <UserCog size={16} className="text-violet-600" />
              </div>
              <h3 className="font-bold text-slate-900">Agent assigné</h3>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                {REQUETE.agent.avatar}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">{REQUETE.agent.nom}</p>
                <p className="text-xs text-slate-500">{REQUETE.agent.role}</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-xl transition-colors">
              <UserCog size={13} /> Réassigner
            </button>
          </div>

          {/* IA — Suggestion */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg shadow-violet-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-violet-200" />
              <h3 className="font-bold text-sm">Suggestion IA</h3>
            </div>
            <p className="text-xs text-violet-100 leading-relaxed mb-4">
              Cette requête est similaire à <strong>12 autres réclamations de note</strong> dans le service Scolarité. Le taux de résolution favorable est de <strong>83%</strong>. Recommandation : Valider après vérification de la copie.
            </p>
            <div className="space-y-2">
              <button className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 rounded-xl transition-colors">
                ✓ Appliquer la suggestion
              </button>
              <button className="w-full bg-transparent hover:bg-white/10 text-violet-200 text-xs py-1.5 rounded-xl transition-colors">
                Ignorer
              </button>
            </div>
          </div>

          {/* Méta-infos */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Informations</h3>
            <div className="space-y-2.5">
              {[
                { label: 'ID de référence', value: `#${REQUETE.id}`, mono: true },
                { label: 'Date de création', value: REQUETE.dateCreation },
                { label: 'Dernière modification', value: REQUETE.dateMiseAJour },
                { label: 'SLA restant', value: REQUETE.delaiRestant },
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
