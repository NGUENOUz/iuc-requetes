'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Upload, X, AlertCircle, CheckCircle,
  Send, Home, Paperclip
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';

const CATEGORIES = [
  { value: 'scolarite', label: 'Scolarité', description: 'Notes, inscriptions, certificats' },
  { value: 'documents', label: 'Documents', description: 'Attestations, relevés de notes' },
  { value: 'pedagogie', label: 'Pédagogie', description: 'Cours, emploi du temps, groupes' },
  { value: 'finance', label: 'Finance', description: 'Paiements, bourses, frais' },
  { value: 'bourse', label: 'Bourse & Aide', description: 'Demandes de bourse et aides financières' },
  { value: 'autre', label: 'Autre', description: 'Autres demandes' },
];

const PRIORITES = [
  { value: 'basse', label: 'Basse', color: 'bg-slate-100 text-slate-600' },
  { value: 'moyenne', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'haute', label: 'Haute', color: 'bg-red-100 text-red-700' },
];

function NouvelleRequeteContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    titre: '',
    categorie: '',
    priorite: 'moyenne',
    description: '',
  });
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFichiers(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFichiers(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis';
    if (!formData.categorie) newErrors.categorie = 'La catégorie est requise';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (formData.description.trim().length < 20) {
      newErrors.description = 'La description doit contenir au moins 20 caractères';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setSuccess(true);

    // Redirection après 2 secondes
    setTimeout(() => {
      router.push('/mes-requetes');
    }, 2000);
  };

  if (success) {
    return (
      <div className="p-3 sm:p-6 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-white rounded-2xl border shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Requête soumise !</h2>
          <p className="text-slate-600 mb-6">
            Votre requête a été envoyée avec succès. Vous recevrez une notification dès qu'elle sera traitée.
          </p>
          <Link
            href="/mes-requetes"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Voir mes requêtes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
          <Home size={14} />
          Tableau de bord
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Nouvelle requête</span>
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
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Nouvelle requête</h1>
            <p className="text-emerald-100 text-sm">Remplissez le formulaire ci-dessous pour soumettre votre demande</p>
          </div>
        </div>
      </div>

      {/* Alerte info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold text-blue-900">Conseils pour votre requête</p>
          <ul className="text-blue-700 mt-2 space-y-1 list-disc list-inside">
            <li>Soyez clair et précis dans votre demande</li>
            <li>Joignez tous les documents nécessaires</li>
            <li>Vous recevrez une réponse sous 48-72h ouvrables</li>
          </ul>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Catégorie */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <label className="block text-sm font-bold text-slate-900 mb-3">
            Catégorie de la requête <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, categorie: value }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.categorie === value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <p className="font-bold text-slate-900 text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              </button>
            ))}
          </div>
          {errors.categorie && (
            <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.categorie}
            </p>
          )}
        </div>

        {/* Titre et Priorité */}
        <div className="bg-white rounded-2xl border shadow-sm p-5 space-y-4">
          {/* Titre */}
          <div>
            <label htmlFor="titre" className="block text-sm font-bold text-slate-900 mb-2">
              Titre de la requête <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Demande de relevé de notes du semestre 1"
              className={`w-full h-12 bg-slate-50 rounded-xl px-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 transition-all ${
                errors.titre ? 'ring-2 ring-red-500' : 'focus:ring-emerald-400'
              }`}
            />
            {errors.titre && (
              <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.titre}
              </p>
            )}
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Niveau de priorité
            </label>
            <div className="flex gap-2">
              {PRIORITES.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priorite: value }))}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                    formData.priorite === value
                      ? `${color} ring-2 ring-offset-2 ${value === 'haute' ? 'ring-red-500' : value === 'moyenne' ? 'ring-yellow-500' : 'ring-slate-500'}`
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <label htmlFor="description" className="block text-sm font-bold text-slate-900 mb-2">
            Description détaillée <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Décrivez votre demande en détail (minimum 20 caractères)..."
            rows={6}
            className={`w-full bg-slate-50 rounded-xl p-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 resize-none transition-all ${
              errors.description ? 'ring-2 ring-red-500' : 'focus:ring-emerald-400'
            }`}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-400">
              {formData.description.length} caractères
            </span>
            {errors.description && (
              <p className="text-red-600 text-xs flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Pièces jointes */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <label className="block text-sm font-bold text-slate-900 mb-3">
            Pièces jointes (optionnel)
          </label>
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
              <Upload size={32} className="text-slate-400 mb-2" />
              <span className="text-sm font-medium text-slate-600">
                Cliquez pour ajouter des fichiers
              </span>
              <span className="text-xs text-slate-400 mt-1">
                PDF, JPEG, PNG (max 5 MB par fichier)
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {fichiers.length > 0 && (
              <div className="space-y-2">
                {fichiers.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                    <Paperclip size={16} className="text-slate-400" />
                    <span className="flex-1 text-sm text-slate-700 truncate">{file.name}</span>
                    <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="w-6 h-6 rounded-full hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Boutons */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex flex-wrap gap-3 justify-end">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Soumettre la requête
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NouvelleRequetePage() {
  return (
    <StudentLayout>
      <NouvelleRequeteContent />
    </StudentLayout>
  );
}
