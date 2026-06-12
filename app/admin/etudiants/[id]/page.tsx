'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ChevronRight, Mail, Phone, MapPin, Calendar,
  GraduationCap, FileText, CheckCircle, Clock, XCircle,
  RefreshCw, Edit3, UserX, UserCheck, Download, Eye,
  MessageSquare, Send, TrendingUp, Award, BookOpen,
  AlertCircle, Star, Shield, MoreHorizontal, Ban,
} from 'lucide-react';

/* ═══════════════════════ DONNÉES MOCKÉES ═══════════════════════ */

const ETUDIANT = {
  id: 'ETU-001',
  nom: 'NGUENOU Wilfried',
  prenom: 'Wilfried',
  matricule: 'IUC2021001',
  avatar: 'NW',
  email: 'w.nguenou@iuc.univ-cm.net',
  telephone: '+237 691 234 567',
  adresse: 'Yaoundé, Cameroun',
  dateNaissance: '14 mars 2001',
  dateInscription: '01 septembre 2021',
  filiere: 'Génie Logiciel',
  departement: 'Informatique',
  niveau: 'L3',
  groupe: 'GL3-A',
  anneeAcademique: '2024-2025',
  statut: 'Actif',
  moyenneGenerale: 14.7,
  creditsValides: 120,
  creditsTotal: 180,
  boursier: true,
};

const STATS = [
  { label: 'Total requêtes', value: 5, icon: FileText, color: 'text-slate-600 bg-slate-100' },
  { label: 'Résolues', value: 3, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'En cours', value: 2, icon: RefreshCw, color: 'text-yellow-600 bg-yellow-50' },
  { label: 'Rejetées', value: 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
];

const REQUETES = [
  { id: 'REQ-1248', categorie: 'Réclamation de note', service: 'Scolarité', statut: 'En cours', priorite: 'Haute', date: '19 mai 2025' },
  { id: 'REQ-1201', categorie: "Demande d'attestation", service: 'Scolarité', statut: 'Résolue', priorite: 'Basse', date: '10 mai 2025' },
  { id: 'REQ-1145', categorie: 'Changement de groupe', service: 'Pédagogie', statut: 'Résolue', priorite: 'Moyenne', date: '02 mai 2025' },
  { id: 'REQ-1089', categorie: 'Problème de paiement', service: 'Finance', statut: 'En cours', priorite: 'Haute', date: '20 avr. 2025' },
  { id: 'REQ-0987', categorie: 'Certificat de scolarité', service: 'Scolarité', statut: 'Résolue', priorite: 'Basse', date: '05 avr. 2025' },
];

const ACTIVITES = [
  { date: '19 mai 2025', action: 'Nouvelle requête soumise', detail: 'Réclamation de note — Scolarité', color: 'bg-blue-100 text-blue-600', icon: FileText },
  { date: '10 mai 2025', action: 'Requête résolue', detail: "Demande d'attestation — Scolarité", color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle },
  { date: '02 mai 2025', action: 'Requête résolue', detail: 'Changement de groupe — Pédagogie', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle },
  { date: '01 avr. 2025', action: 'Connexion au portail', detail: 'Accès depuis Yaoundé, CM', color: 'bg-slate-100 text-slate-600', icon: Shield },
  { date: '15 mar. 2025', action: 'Profil mis à jour', detail: 'Numéro de téléphone modifié', color: 'bg-violet-100 text-violet-600', icon: Edit3 },
];

const NOTES = [
  { matiere: 'Algorithmes Avancés', coeff: 4, note: 15.5, mention: 'Bien' },
  { matiere: 'Développement Web', coeff: 3, note: 17.0, mention: 'Très Bien' },
  { matiere: 'Base de données', coeff: 4, note: 13.0, mention: 'Assez Bien' },
  { matiere: 'Mathématiques Avancées', coeff: 3, note: 10, mention: 'En litige', litige: true },
  { matiere: 'Anglais Technique', coeff: 2, note: 16.5, mention: 'Bien' },
];

/* ═══════════════════════ STYLES ═══════════════════════ */

const statutStyle: Record<string, string> = {
  'En attente': 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  'En cours':   'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  'Résolue':    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  'Rejetée':    'bg-red-100 text-red-700 ring-1 ring-red-200',
};
const prioriteStyle: Record<string, string> = {
  'Haute':   'bg-red-50 text-red-600',
  'Moyenne': 'bg-yellow-50 text-yellow-700',
  'Basse':   'bg-slate-100 text-slate-500',
};
const mentionColor: Record<string, string> = {
  'Très Bien':  'text-emerald-600',
  'Bien':       'text-blue-600',
  'Assez Bien': 'text-yellow-600',
  'En litige':  'text-red-600',
};

/* ═══════════════════════ COMPOSANT ═══════════════════════ */

export default function AdminEtudiantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'requetes' | 'notes' | 'activite'>('requetes');
  const [statutLocal, setStatutLocal] = useState(ETUDIANT.statut);
  const [note, setNote] = useState('');

  const creditsPct = Math.round((ETUDIANT.creditsValides / ETUDIANT.creditsTotal) * 100);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px]">

      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/etudiants"
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all shadow-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900">{ETUDIANT.nom}</h1>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">{ETUDIANT.matricule}</p>
          </div>
        </div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Link href="/admin" className="hover:text-emerald-600 transition-colors">Tableau de bord</Link>
          <ChevronRight size={12} />
          <Link href="/admin/etudiants" className="hover:text-emerald-600 transition-colors">Étudiants</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-semibold">{ETUDIANT.nom}</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-2">
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-600/20">
          <Edit3 size={14} /> Modifier le profil
        </button>
        {statutLocal === 'Actif' ? (
          <button onClick={() => setStatutLocal('Suspendu')}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-red-500/20">
            <UserX size={14} /> Suspendre
          </button>
        ) : (
          <button onClick={() => setStatutLocal('Actif')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
            <UserCheck size={14} /> Réactiver
          </button>
        )}
        <a href={`mailto:${ETUDIANT.email}`}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm">
          <Mail size={14} /> Envoyer un email
        </a>
        <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-sm ml-auto">
          <Download size={14} /> Exporter le dossier
        </button>
      </div>

      {/* ── Contenu principal ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Colonne gauche ── */}
        <div className="space-y-4">

          {/* Carte profil */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Bannière */}
            <div className="h-20 bg-gradient-to-r from-emerald-600 to-green-500 relative">
              {ETUDIANT.boursier && (
                <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={10} /> Boursier
                </span>
              )}
            </div>
            {/* Avatar */}
            <div className="px-5 pb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white text-xl font-black flex items-center justify-center -mt-8 mb-3 border-4 border-white shadow-md">
                {ETUDIANT.avatar}
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-black text-slate-900 text-base">{ETUDIANT.nom}</h2>
                  <p className="text-xs text-slate-500">{ETUDIANT.filiere} · {ETUDIANT.niveau}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg mt-1 ${
                  statutLocal === 'Actif' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' :
                  statutLocal === 'Suspendu' ? 'bg-red-100 text-red-700 ring-1 ring-red-200' :
                  'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                }`}>
                  {statutLocal === 'Actif' ? <UserCheck size={11} /> : <UserX size={11} />}
                  {statutLocal}
                </span>
              </div>
            </div>
          </div>

          {/* Infos de contact */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Informations</h3>
            <div className="space-y-3">
              {[
                { icon: Mail, label: ETUDIANT.email, href: `mailto:${ETUDIANT.email}`, color: 'bg-blue-50 text-blue-500' },
                { icon: Phone, label: ETUDIANT.telephone, href: `tel:${ETUDIANT.telephone}`, color: 'bg-emerald-50 text-emerald-500' },
                { icon: MapPin, label: ETUDIANT.adresse, color: 'bg-slate-100 text-slate-500' },
                { icon: Calendar, label: `Né(e) le ${ETUDIANT.dateNaissance}`, color: 'bg-violet-50 text-violet-500' },
                { icon: GraduationCap, label: `Inscrit(e) le ${ETUDIANT.dateInscription}`, color: 'bg-yellow-50 text-yellow-600' },
              ].map(({ icon: Icon, label, href, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={13} />
                  </div>
                  {href ? (
                    <a href={href} className="text-xs text-slate-600 hover:text-emerald-600 transition-colors truncate">{label}</a>
                  ) : (
                    <span className="text-xs text-slate-600 truncate">{label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scolarité */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Parcours académique</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Département', value: ETUDIANT.departement },
                { label: 'Filière', value: ETUDIANT.filiere },
                { label: 'Niveau', value: ETUDIANT.niveau },
                { label: 'Groupe', value: ETUDIANT.groupe },
                { label: 'Année académique', value: ETUDIANT.anneeAcademique },
                { label: 'Moyenne générale', value: `${ETUDIANT.moyenneGenerale}/20`, bold: true },
              ].map(({ label, value, bold }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">{label}</span>
                  <span className={`text-xs ${bold ? 'font-black text-emerald-700' : 'font-bold text-slate-700'}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Progression crédits */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-400 font-medium">Crédits validés</span>
                <span className="text-xs font-black text-slate-700">{ETUDIANT.creditsValides}/{ETUDIANT.creditsTotal}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all"
                  style={{ width: `${creditsPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{creditsPct}% du parcours validé</p>
            </div>
          </div>

          {/* Note interne admin */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <MessageSquare size={13} className="text-violet-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Note interne</h3>
            </div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ajouter une note confidentielle sur cet étudiant..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-emerald-300 transition-all resize-none"
            />
            <button
              disabled={!note.trim()}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-xl transition-colors"
            >
              <Send size={12} /> Enregistrer la note
            </button>
          </div>
        </div>

        {/* ── Colonne droite (2/3) ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                  <Icon size={17} />
                </div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Onglets */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-100">
              {[
                { key: 'requetes', label: 'Requêtes', count: REQUETES.length },
                { key: 'notes', label: 'Relevé de notes', count: NOTES.length },
                { key: 'activite', label: "Journal d'activité", count: ACTIVITES.length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                    activeTab === key
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Onglet Requêtes ── */}
            {activeTab === 'requetes' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['ID', 'Catégorie', 'Service', 'Statut', 'Priorité', 'Date', ''].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {REQUETES.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">#{r.id}</td>
                        <td className="py-3 px-4 text-xs text-slate-700 font-medium max-w-[160px]">
                          <p className="truncate">{r.categorie}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-medium">{r.service}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${statutStyle[r.statut]}`}>
                            {r.statut === 'En cours' && <RefreshCw size={10} />}
                            {r.statut === 'Résolue' && <CheckCircle size={10} />}
                            {r.statut === 'En attente' && <Clock size={10} />}
                            {r.statut}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${prioriteStyle[r.priorite]}`}>{r.priorite}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">{r.date}</td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/requetes/${r.id}`}
                            className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100">
                            <Eye size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Onglet Notes ── */}
            {activeTab === 'notes' && (
              <div className="p-5">
                {/* Résumé */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-center">
                    <p className="text-2xl font-black text-emerald-700">{ETUDIANT.moyenneGenerale}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">Moyenne générale</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-center">
                    <p className="text-2xl font-black text-blue-700">{ETUDIANT.creditsValides}</p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">Crédits validés</p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-3 border border-violet-100 text-center">
                    <p className="text-2xl font-black text-violet-700">Bien</p>
                    <p className="text-xs text-violet-600 font-medium mt-0.5">Mention globale</p>
                  </div>
                </div>

                {/* Tableau des notes */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 rounded-xl">
                      <tr>
                        {['Matière', 'Coeff.', 'Note /20', 'Mention', ''].map(h => (
                          <th key={h} className="text-left py-2.5 px-3 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {NOTES.map(n => (
                        <tr key={n.matiere} className={`hover:bg-slate-50 transition-colors ${n.litige ? 'bg-red-50/30' : ''}`}>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-slate-800">{n.matiere}</p>
                              {n.litige && (
                                <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <AlertCircle size={9} /> Litige
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-500">{n.coeff}</td>
                          <td className="py-3 px-3">
                            <span className={`text-sm font-black ${n.note >= 14 ? 'text-emerald-600' : n.note >= 10 ? 'text-slate-700' : 'text-red-600'}`}>
                              {n.note.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-xs font-bold ${mentionColor[n.mention] || 'text-slate-600'}`}>{n.mention}</span>
                          </td>
                          <td className="py-3 px-3">
                            {n.litige && (
                              <Link href="/admin/requetes/REQ-1248"
                                className="text-[11px] text-red-600 hover:text-red-800 font-semibold hover:underline whitespace-nowrap">
                                Voir la requête →
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Onglet Activité ── */}
            {activeTab === 'activite' && (
              <div className="p-5">
                <div className="space-y-0">
                  {ACTIVITES.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <div key={i} className="flex gap-3 relative">
                        {i < ACTIVITES.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-px bg-slate-100" />
                        )}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 ${a.color}`}>
                          <Icon size={13} />
                        </div>
                        <div className="flex-1 pb-5">
                          <p className="text-sm font-semibold text-slate-800">{a.action}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{a.detail}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{a.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Widget IA */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg shadow-violet-500/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={16} className="text-violet-200" />
                  <h3 className="font-bold text-sm">Analyse IA — Profil étudiant</h3>
                </div>
                <p className="text-xs text-violet-100 leading-relaxed mb-3">
                  NGUENOU Wilfried présente un profil <strong>académiquement solide</strong> (moy. 14.7/20).
                  Le litige sur la note de Mathématiques est le seul point bloquant.
                  Risque d&apos;abandon : <strong>Faible</strong>. Engagement : <strong>Élevé</strong>.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-white/20 rounded-lg px-2.5 py-1 text-xs font-bold">Engagement ↑</div>
                  <div className="bg-white/20 rounded-lg px-2.5 py-1 text-xs font-bold">Note litigée ⚠</div>
                  <div className="bg-white/20 rounded-lg px-2.5 py-1 text-xs font-bold">Boursier ✓</div>
                </div>
              </div>
              <div className="bg-white/20 rounded-2xl p-3 shrink-0">
                <TrendingUp size={28} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
