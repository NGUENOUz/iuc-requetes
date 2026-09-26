'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, Upload, X, AlertCircle, CheckCircle,
  Send, Home, Paperclip, Loader2, Zap, ShieldCheck, Printer, ExternalLink
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { useStudent, useCategories } from '@/lib/hooks';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';

const PRIORITES = [
  { value: 'basse', label: 'Basse (Normale)' },
  { value: 'moyenne', label: 'Moyenne (Standard)' },
  { value: 'haute', label: 'Haute (Urgente)' },
];

function NouvelleRequeteContent() {
  const router = useRouter();
  const { student, loading: studentLoading } = useStudent();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [formData, setFormData] = useState({
    titre: '',
    categorie: '',
    priorite: '',
    description: '',
  });
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDocModal, setShowDocModal] = useState(false);

  // Filtrer les catégories selon le rôle du requérant (étudiant, enseignant, personnel)
  const userRole = student?.role_code || 'etudiant';

  const availableCategories = categories.filter((cat) => {
    if (!cat.target_role || cat.target_role === 'all') return true;
    const roles = cat.target_role.split(',').map((r) => r.trim().toLowerCase());
    return roles.includes(userRole.toLowerCase());
  });

  const selectedCategoryObj = categories.find((c) => c.id === formData.categorie);

  // Définir une priorité par défaut une fois les données chargées
  useEffect(() => {
    if (!formData.priorite && categories.length > 0) {
      fetch('/api/priorities')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data.length > 0) {
            const normalPriority = data.data.find(
              (p: any) => p.name === 'Normale' || p.name === 'Moyenne'
            );
            if (normalPriority) {
              setFormData((prev) => ({ ...prev, priorite: normalPriority.id }));
            }
          }
        })
        .catch(console.error);
    }
  }, [categories, formData.priorite]);

  const handleSelectCategory = (cat: any) => {
    setFormData((prev) => {
      let defaultDesc = prev.description;
      let defaultTitle = prev.titre;

      if (!prev.titre || prev.titre.trim() === '') {
        defaultTitle = `Demande : ${cat.name}`;
      }

      if (!prev.description || prev.description.trim() === '') {
        if (cat.is_auto_resolvable) {
          if (userRole === 'enseignant') {
            defaultDesc = `Demande d'attestation de travail et de services d'enseignement pour l'année académique ${student?.annee_academique || '2025-2026'}.`;
          } else if (userRole === 'personnel') {
            defaultDesc = `Demande d'attestation de travail et prise de service administrative pour l'année en cours.`;
          } else {
            defaultDesc = `Demande d'attestation de scolarité officielle pour l'année académique ${student?.annee_academique || '2025-2026'}.`;
          }
        }
      }

      return {
        ...prev,
        categorie: cat.id,
        titre: defaultTitle,
        description: defaultDesc,
      };
    });

    if (errors.categorie) {
      setErrors((prev) => ({ ...prev, categorie: '' }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFichiers((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFichiers((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis';
    if (!formData.categorie) newErrors.categorie = 'La catégorie est requise';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (formData.description.trim().length < 15) {
      newErrors.description = 'La description doit contenir au moins 15 caractères';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/');
        return;
      }

      const priorityRes = await fetch('/api/priorities');
      const priorityData = await priorityRes.json();
      const selectedPriority = priorityData.data?.find(
        (p: any) =>
          p.name.toLowerCase() === formData.priorite.toLowerCase() ||
          p.id === formData.priorite
      ) || priorityData.data?.[0];

      if (!selectedPriority) {
        toast.error('Erreur de priorité');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: formData.titre,
          description: formData.description,
          category_id: formData.categorie,
          priority_id: selectedPriority.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erreur lors de la création de la requête');
      }

      const created = result.data;
      setSuccessData(created);

      if (created.metadata?.auto_resolved) {
        toast.success('Document officiel certifié généré !', { duration: 4000 });
      } else {
        toast.success('Demande enregistrée et assignée au service !');
      }
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.message || 'Erreur lors de la création de la requête');
    } finally {
      setLoading(false);
    }
  };

  // Écran de confirmation Black & White
  if (successData) {
    const isAuto = successData.metadata?.auto_resolved;
    const docCode = successData.metadata?.document_code;

    return (
      <div className="p-4 sm:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 sm:p-10 max-w-lg w-full text-center">
          
          <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-5 shadow-xs">
            {isAuto ? <Zap size={28} /> : <CheckCircle size={28} />}
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 mb-2">
            {isAuto ? 'Document Prêt & Certifié Numériquement' : 'Demande Soumise avec Succès'}
          </h2>

          <p className="text-zinc-500 text-xs sm:text-sm mb-6 leading-relaxed">
            {isAuto ? (
              <>
                Votre certificat officiel a été émis et scellé électroniquement avec son QR Code d'authentification universitaire.
              </>
            ) : (
              <>
                Votre demande porte la référence <strong className="text-black font-mono">{successData.reference}</strong> et a été transmise au service instructeur compétent.
              </>
            )}
          </p>

          {isAuto && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 mb-6 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <span className="text-xs font-mono uppercase text-zinc-500 font-bold">Réf. Demande</span>
                <span className="text-xs font-mono font-bold text-zinc-900">{successData.reference}</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <span className="text-xs font-mono uppercase text-zinc-500 font-bold">Code Certificat</span>
                <span className="text-xs font-mono font-bold text-black">{docCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-500 font-bold">Statut de validation</span>
                <span className="text-xs font-bold text-black flex items-center gap-1">
                  <ShieldCheck size={14} /> Scellé (Direction des Études)
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors"
                >
                  <Printer size={15} />
                  Consulter & Imprimer
                </button>
                {docCode && (
                  <Link
                    href={`/verify/${docCode}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <ExternalLink size={13} />
                    Contrôle QR
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <Link
              href="/mes-requetes"
              className="inline-flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white font-bold px-6 py-2.5 rounded-lg transition-colors text-xs"
            >
              Voir la liste des requêtes
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccessData(null);
                setFormData({ titre: '', categorie: '', priorite: '', description: '' });
              }}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-semibold px-5 py-2.5 rounded-lg transition-colors text-xs"
            >
              Nouvelle demande
            </button>
          </div>

          {/* Modal du document */}
          {isAuto && docCode && (
            <OfficialDocumentModal
              isOpen={showDocModal}
              onClose={() => setShowDocModal(false)}
              document={{
                type: 'attestation',
                title: successData.title,
                code: docCode,
                date: new Date().toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }),
                requesterName: `${student?.first_name} ${student?.last_name}`,
                matricule: student?.matricule || 'N/A',
                programOrFunction:
                  userRole === 'enseignant'
                    ? (student?.fonction || 'Enseignant - IUC')
                    : userRole === 'personnel'
                    ? (student?.fonction || 'Personnel Administratif')
                    : `${student?.filiere || 'Génie Logiciel'} (${student?.niveau || 'L3'})`,
                academicYear: student?.annee_academique || '2025-2026',
              }}
            />
          )}

        </div>
      </div>
    );
  }

  if (studentLoading || categoriesLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mx-auto mb-3" />
          <p className="text-zinc-500 text-xs font-mono">Chargement du formulaire de requête...</p>
        </div>
      </div>
    );
  }

  const roleTitle =
    userRole === 'enseignant'
      ? 'Nouvelle requête académique ou administrative'
      : userRole === 'personnel'
      ? 'Nouvelle demande interne de service'
      : 'Formulaire de nouvelle requête';

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      
      {/* Navigation retour */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          Retour au tableau de bord
        </Link>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
          Système IUC v2.5
        </span>
      </div>

      {/* Titre & Description Monochrome */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-black text-white font-bold">
                {userRole}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-xs text-zinc-500 font-mono">
                {student?.matricule}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              {roleTitle}
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1">
              Remplissez les champs ci-dessous pour transmettre votre requête aux services universitaires.
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire Principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Étape 1 : Sélection Catégorie */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-950 tracking-tight">
                1. Sélectionner la catégorie de la demande <span className="text-red-500">*</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Chaque catégorie applique un délai maximal de réponse (SLA).
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {availableCategories.length} catégories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableCategories.map((category) => {
              const isSelected = formData.categorie === category.id;
              const isAuto = category.is_auto_resolvable;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className={`p-3.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-black bg-zinc-50 ring-1 ring-black shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <span className="font-bold text-zinc-950 text-xs leading-snug">
                        {category.name}
                      </span>
                      {isAuto && (
                        <span className="shrink-0 text-[9px] font-mono uppercase bg-black text-white px-1.5 py-0.2 rounded font-bold">
                          ⚡ Instant
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>SLA : {category.sla_hours || 48}h</span>
                    <span className={isSelected ? 'text-black font-bold' : 'text-zinc-400'}>
                      {isSelected ? '✓ Actif' : 'Choisir'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {errors.categorie && (
            <p className="text-red-600 text-xs mt-2 flex items-center gap-1 font-medium">
              <AlertCircle size={13} />
              {errors.categorie}
            </p>
          )}

          {selectedCategoryObj?.is_auto_resolvable && (
            <div className="p-3.5 bg-[#09090b] text-white rounded-lg flex items-center gap-3 text-xs">
              <Zap size={16} className="text-white shrink-0" />
              <p className="text-zinc-300">
                <strong className="text-white">Délivrance Numérique Instantanée :</strong> Ce certificat officiel sera délivré et vérifiable immédiatement à la soumission.
              </p>
            </div>
          )}
        </div>

        {/* Étape 2 : Intitulé et Priorité */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-950 tracking-tight border-b border-zinc-100 pb-3">
            2. Intitulé et niveau d'urgence
          </h2>

          <div>
            <label htmlFor="titre" className="block text-xs font-mono uppercase text-zinc-500 font-bold mb-1.5">
              Objet succinct de la demande <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Demande d'attestation officielle de scolarité..."
              className={`w-full h-10 bg-white border rounded-lg px-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition-all ${
                errors.titre ? 'border-red-500' : 'border-zinc-200 focus:border-black'
              }`}
            />
            {errors.titre && (
              <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.titre}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-500 font-bold mb-1.5">
              Niveau de priorité
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, priorite: value }))}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                    formData.priorite === value
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Étape 3 : Exposé des motifs */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 tracking-tight">
              3. Détails & Précisions <span className="text-red-500">*</span>
            </h2>
            <span className="text-[10px] font-mono text-zinc-400">
              {formData.description.length} car. (min 15)
            </span>
          </div>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Détaillez le contexte de votre demande..."
            rows={4}
            className={`w-full bg-white border rounded-lg p-3 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none resize-none transition-all ${
              errors.description ? 'border-red-500' : 'border-zinc-200 focus:border-black'
            }`}
          />
          {errors.description && (
            <p className="text-red-600 text-xs flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.description}
            </p>
          )}
        </div>

        {/* Étape 4 : Pièces justificatives */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-950 tracking-tight border-b border-zinc-100 pb-3">
            4. Pièces justificatives (optionnel)
          </h2>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg p-5 cursor-pointer hover:border-black hover:bg-zinc-50 transition-all">
            <Upload size={22} className="text-zinc-400 mb-1" />
            <span className="text-xs font-bold text-zinc-800">
              Cliquer pour ajouter un fichier justificatif
            </span>
            <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
              PDF, JPG, PNG (Max 10 MB)
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
            <div className="space-y-1.5">
              {fichiers.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-800 font-mono">
                  <Paperclip size={14} className="text-zinc-400" />
                  <span className="flex-1 truncate font-medium">{file.name}</span>
                  <span className="text-[10px] text-zinc-400">{(file.size / 1024).toFixed(0)} KB</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="w-5 h-5 rounded hover:bg-zinc-200 flex items-center justify-center text-zinc-500"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions de validation */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-black hover:bg-zinc-800 disabled:bg-zinc-300 text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-all shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Traitement...
              </>
            ) : selectedCategoryObj?.is_auto_resolvable ? (
              <>
                <Zap size={14} />
                Générer & Certifier Immédiatement
              </>
            ) : (
              <>
                <Send size={14} />
                Transmettre au service
              </>
            )}
          </button>
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
