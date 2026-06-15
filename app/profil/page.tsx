'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, GraduationCap,
  Edit2, Save, X, Camera, Hash, BookOpen, Building, CreditCard,
  Home, Shield, CheckCircle
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';

const PROFIL_DATA = {
  nom: 'NGUENOU',
  prenom: 'Wilfried',
  matricule: 'IUC2021001',
  email: 'wilfried.nguenou@iuc.edu.cm',
  telephone: '+237 6 XX XX XX XX',
  dateNaissance: '15 mars 2003',
  lieuNaissance: 'Douala, Cameroun',
  adresse: 'Akwa, Douala',
  
  // Infos académiques
  niveau: 'Licence 3',
  filiere: 'Informatique et Génie Logiciel',
  specialite: 'Développement Web & Mobile',
  anneeAcademique: '2024-2025',
  statut: 'Inscrit',
  
  // Statistiques
  stats: {
    requetes: 12,
    resolues: 3,
    moyenne: '4.2 jours',
  }
};

function ProfilContent() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: PROFIL_DATA.email,
    telephone: PROFIL_DATA.telephone,
    adresse: PROFIL_DATA.adresse,
  });
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      email: PROFIL_DATA.email,
      telephone: PROFIL_DATA.telephone,
      adresse: PROFIL_DATA.adresse,
    });
    setIsEditing(false);
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
        <span className="text-slate-900 font-medium">Mon profil</span>
      </div>

      {/* Bouton retour */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        Retour au tableau de bord
      </Link>

      {/* Message de succès */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-900">
            Vos informations ont été mises à jour avec succès !
          </p>
        </div>
      )}

      {/* En-tête avec photo */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Photo de profil */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-emerald-600 font-black text-3xl border-4 border-white/30">
                {PROFIL_DATA.prenom[0]}{PROFIL_DATA.nom[0]}
              </div>
              <button className="absolute inset-0 w-24 h-24 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </button>
            </div>

            {/* Informations principales */}
            <div className="flex-1 text-center sm:text-left text-white">
              <h1 className="text-2xl font-black mb-1">
                {PROFIL_DATA.prenom} {PROFIL_DATA.nom}
              </h1>
              <p className="text-emerald-100 text-sm mb-3">
                {PROFIL_DATA.filiere} • {PROFIL_DATA.niveau}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-semibold">
                  <Hash size={12} />
                  {PROFIL_DATA.matricule}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-500 px-3 py-1 rounded-lg text-xs font-bold">
                  <CheckCircle size={12} />
                  {PROFIL_DATA.statut}
                </span>
              </div>
            </div>

            {/* Bouton éditer */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-white text-emerald-600 font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                <Edit2 size={16} />
                Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-white text-emerald-600 font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <X size={16} />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 px-6 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-white">{PROFIL_DATA.stats.requetes}</p>
              <p className="text-xs text-emerald-100">Requêtes</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{PROFIL_DATA.stats.resolues}</p>
              <p className="text-xs text-emerald-100">Résolues</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{PROFIL_DATA.stats.moyenne}</p>
              <p className="text-xs text-emerald-100">Temps moyen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Informations personnelles */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User size={18} />
            Informations personnelles
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <User size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Nom complet</p>
                <p className="font-semibold text-slate-900">{PROFIL_DATA.prenom} {PROFIL_DATA.nom}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <Mail size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                ) : (
                  <p className="font-semibold text-slate-900">{formData.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <Phone size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Téléphone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full bg-white rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                ) : (
                  <p className="font-semibold text-slate-900">{formData.telephone}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Date de naissance</p>
                <p className="font-semibold text-slate-900">{PROFIL_DATA.dateNaissance}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Lieu de naissance</p>
                <p className="font-semibold text-slate-900">{PROFIL_DATA.lieuNaissance}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Adresse actuelle</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    className="w-full bg-white rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                ) : (
                  <p className="font-semibold text-slate-900">{formData.adresse}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informations académiques */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <GraduationCap size={18} />
            Informations académiques
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <Hash size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Matricule</p>
                <p className="font-semibold text-slate-900 font-mono">{PROFIL_DATA.matricule}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <BookOpen size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Filière</p>
                <p className="font-semibold text-slate-900">{PROFIL_DATA.filiere}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <GraduationCap size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Niveau</p>
                <p className="font-semibold text-slate-900">{PROFIL_DATA.niveau}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <BookOpen size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Spécialité</p>
                <p className="font-semibold text-slate-900">{PROFIL_DATA.specialite}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <Calendar size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Année académique</p>
                <p className="font-semibold text-slate-900">{PROFIL_DATA.anneeAcademique}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-emerald-600">Statut</p>
                <p className="font-bold text-emerald-700">{PROFIL_DATA.statut}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <h2 className="font-bold text-slate-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/mes-requetes"
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="font-bold text-blue-900 text-sm">Mes requêtes</p>
              <p className="text-xs text-blue-600">Consulter l'historique</p>
            </div>
          </Link>

          <Link
            href="/documents"
            className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white">
              <Building size={20} />
            </div>
            <div>
              <p className="font-bold text-purple-900 text-sm">Documents</p>
              <p className="text-xs text-purple-600">Attestations & relevés</p>
            </div>
          </Link>

          <Link
            href="/parametres"
            className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="w-10 h-10 bg-slate-500 rounded-xl flex items-center justify-center text-white">
              <Shield size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Sécurité</p>
              <p className="text-xs text-slate-600">Changer mot de passe</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <StudentLayout>
      <ProfilContent />
    </StudentLayout>
  );
}
