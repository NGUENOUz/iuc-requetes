'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  FileCheck,
  Zap,
  CheckCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StudentLayout from '../components/StudentLayout';
import { useStudent, useCategories } from '@/lib/hooks';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedStepper from '@/components/ui/AnimatedStepper';
import RequestTimeline from '@/components/ui/RequestTimeline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import StatusBadge from '@/components/ui/StatusBadge';
import Skeleton from '@/components/ui/Skeleton';

const STEPS = [
  { id: 1, title: 'Démarche', description: 'Choix du service' },
  { id: 2, title: 'Détails', description: 'Motif et pièces' },
  { id: 3, title: 'Validation', description: 'Récapitulatif' },
];

function NouvelleRequeteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { student, loading: studentLoading } = useStudent();
  const { categories, loading: categoriesLoading } = useCategories();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    titre: searchParams.get('titre') || '',
    categorie: '',
    priorite: '',
    description: searchParams.get('description') || '',
  });
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDocModal, setShowDocModal] = useState(false);

  const userRole = student?.role_code || 'etudiant';

  const availableCategories = categories.filter((cat) => {
    if (!cat.target_role || cat.target_role === 'all') return true;
    const roles = cat.target_role.split(',').map((r) => r.trim().toLowerCase());
    return roles.includes(userRole.toLowerCase());
  });

  const selectedCategoryObj = categories.find((c) => c.id === formData.categorie);

  // Pré-remplissage selon paramètres URL
  useEffect(() => {
    const source = searchParams.get('source');
    const paramTitre = searchParams.get('titre');
    const paramDesc = searchParams.get('description');

    if (categories.length > 0) {
      if (source === 'releve_notes') {
        const claimCat = categories.find(
          (c) =>
            c.name.toLowerCase().includes('réclamation') ||
            c.name.toLowerCase().includes('note')
        );
        if (claimCat) {
          setFormData((prev) => ({
            ...prev,
            categorie: claimCat.id,
            titre: paramTitre || prev.titre,
            description: paramDesc || prev.description,
          }));
        }
      } else if (source === 'planner_salle') {
        const roomCat = categories.find(
          (c) =>
            c.name.toLowerCase().includes('matériel') ||
            c.name.toLowerCase().includes('salle') ||
            c.name.toLowerCase().includes('panne')
        );
        if (roomCat) {
          setFormData((prev) => ({
            ...prev,
            categorie: roomCat.id,
            titre: paramTitre || prev.titre,
            description: paramDesc || prev.description,
          }));
        }
      }
    }
  }, [categories, searchParams]);

  // Priorité par défaut
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
            defaultDesc = `Demande d'attestation de travail et services d'enseignement pour l'année ${
              student?.annee_academique || '2025-2026'
            }.`;
          } else if (userRole === 'personnel') {
            defaultDesc = `Demande d'attestation de travail et prise de service administrative pour l'année en cours.`;
          } else {
            defaultDesc = `Demande d'attestation de scolarité officielle pour l'année académique ${
              student?.annee_academique || '2025-2026'
            }.`;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFichiers((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFichiers((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.categorie) newErrors.categorie = 'Veuillez sélectionner une démarche';
    }
    if (step === 2) {
      if (!formData.titre.trim()) newErrors.titre = 'L&apos;intitulé de la demande est requis';
      if (!formData.description.trim()) {
        newErrors.description = 'Veuillez décrire le motif de votre démarche';
      } else if (formData.description.trim().length < 15) {
        newErrors.description = 'La description doit comporter au moins 15 caractères';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) {
      setCurrentStep(2);
      return;
    }

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
      const selectedPriority =
        priorityData.data?.find(
          (p: any) =>
            p.name.toLowerCase() === formData.priorite.toLowerCase() ||
            p.id === formData.priorite
        ) || priorityData.data?.[0];

      if (!selectedPriority) {
        toast.error('Erreur lors du traitement de la priorité');
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
        toast.success('Demande transmise avec succès !');
      }
    } catch (error: any) {
      console.error('Error creating request:', error);
      toast.error(error.message || 'Erreur lors de la création de la requête');
    } finally {
      setLoading(false);
    }
  };

  // ── ÉCRAN DE SUCCÈS APRÈS TRANSMISSION ──
  if (successData) {
    const isAuto = successData.metadata?.auto_resolved;
    const docCode = successData.metadata?.document_code;

    return (
      <div className="p-4 sm:p-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <GlassCard variant="glass" withShine={true} className="p-6 sm:p-10 max-w-lg w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-accent text-accent-fg flex items-center justify-center mx-auto shadow-md">
            {isAuto ? <Zap size={26} /> : <CheckCircle size={26} />}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-fg tracking-tight">
              {isAuto ? 'Document certifié immédiatement' : 'Demande transmise avec succès'}
            </h2>
            <p className="text-sm text-fg-muted">
              {isAuto
                ? 'Ton attestation a été scellée électroniquement avec QR code officiel.'
                : `Ta demande porte la référence ${successData.reference} et a été assignée aux services compétents.`}
            </p>
          </div>

          {/* Frise initiale de la requête créée */}
          <div className="p-4 rounded-lg bg-surface/80 border border-line/60 text-left">
            <RequestTimeline
              variant="compact"
              statusSentence={
                isAuto
                  ? 'Attestation prête et téléchargeable sans délai.'
                  : 'Reçue aujourd’hui. En cours d’aiguillage par la scolarité.'
              }
              steps={[
                { id: '1', label: 'Déposée', date: 'Aujourd’hui', status: 'completed' },
                {
                  id: '2',
                  label: 'Instruction',
                  date: undefined,
                  status: isAuto ? 'completed' : 'current',
                },
                {
                  id: '3',
                  label: 'Résolue',
                  date: isAuto ? 'Prête' : undefined,
                  status: isAuto ? 'completed' : 'upcoming',
                },
              ]}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isAuto && (
              <Button
                variant="primary"
                onClick={() => setShowDocModal(true)}
                leftIcon={<FileCheck size={16} />}
              >
                Télécharger le document
              </Button>
            )}
            <Link href="/mes-requetes">
              <Button variant="secondary">
                Voir toutes mes requêtes
              </Button>
            </Link>
          </div>
        </GlassCard>

        {showDocModal && (
          <OfficialDocumentModal
            isOpen={showDocModal}
            onClose={() => setShowDocModal(false)}
            document={{
              type: 'attestation',
              title: successData.title,
              code: docCode || 'CERT-IUC-2026',
              date: new Date().toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
              requesterName: `${student?.first_name || ''} ${student?.last_name || ''}`.trim() || 'Étudiant',
              matricule: student?.matricule || 'N/A',
              programOrFunction: `${student?.filiere || 'Génie Logiciel'} (${student?.niveau || 'L3'})`,
              academicYear: student?.annee_academique || '2025-2026',
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* En-tête sobre avec bouton retour */}
      <div className="flex items-center justify-between pb-4 border-b border-line">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-md border border-line flex items-center justify-center text-fg-secondary hover:text-fg hover:bg-surface-hover transition-colors-fast"
            aria-label="Retour au tableau de bord"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-fg tracking-tight">
              Nouvelle démarche académique
            </h1>
            <p className="text-xs text-fg-muted">
              Transmets ta demande directement au service universitaire compétent.
            </p>
          </div>
        </div>
      </div>

      {/* ── STEPPER ANIMÉ ── */}
      <GlassCard variant="glass" withShine={false} className="p-4 sm:p-6">
        <AnimatedStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(s) => setCurrentStep(s)}
        />
      </GlassCard>

      {/* ── CONTENU DU FORMULAIRE PAR ÉTAPE (Transitions fluides AnimatePresence) ── */}
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {/* ÉTAPE 1 : CHOIX DE LA DÉMARCHE */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-fg">
                  1. Choisis le type de démarche
                </h2>
                <p className="text-xs text-fg-muted">
                  Sélectionne la démarche qui correspond à ton besoin.
                </p>
                {errors.categorie && (
                  <p className="text-xs text-danger-fg font-medium pt-1">
                    {errors.categorie}
                  </p>
                )}
              </div>

              {categoriesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                  <Skeleton className="h-28" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableCategories.map((cat) => {
                    const isSelected = formData.categorie === cat.id;

                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat)}
                        className={`p-4 rounded-lg border transition-all cursor-pointer relative select-none ${
                          isSelected
                            ? 'glass border-accent ring-2 ring-accent/30 shadow-md'
                            : 'glass hover:border-line-strong'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-semibold text-fg">
                            {cat.name}
                          </p>
                          {cat.is_auto_resolvable && (
                            <StatusBadge variant="info">
                              Instantané
                            </StatusBadge>
                          )}
                        </div>

                        <p className="text-xs text-fg-muted line-clamp-2 leading-relaxed">
                          {cat.description || 'Démarche administrative standard.'}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-line/50 flex items-center justify-between text-[11px] text-fg-secondary">
                          <span>
                            {cat.is_auto_resolvable
                              ? 'Délivrance immédiate'
                              : 'Délai moyen : 48h'}
                          </span>
                          <span
                            className={`font-semibold ${
                              isSelected ? 'text-accent' : 'text-fg-muted'
                            }`}
                          >
                            {isSelected ? 'Sélectionné' : 'Choisir'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-end pt-4">
                <Button
                  type="button"
                  variant="primary"
                  onClick={goToNextStep}
                  disabled={!formData.categorie}
                  rightIcon={<ArrowRight size={15} />}
                >
                  Continuer
                </Button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 2 : DÉTAILS DE LA DEMANDE */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-fg">
                  2. Détails et justificatifs
                </h2>
                <p className="text-xs text-fg-muted">
                  Précise ta situation pour permettre un traitement rapide.
                </p>
              </div>

              <GlassCard variant="solid" className="space-y-4">
                <Input
                  label="Intitulé de la demande *"
                  name="titre"
                  value={formData.titre}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, titre: e.target.value }))
                  }
                  error={errors.titre}
                  placeholder="Ex: Demande de révision de copie INF302"
                />

                <Textarea
                  label="Description détaillée du motif *"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  error={errors.description}
                  placeholder="Explique clairement les éléments motivant ta requête (minimum 15 caractères)..."
                  helperText="Les dossiers motivés et précis sont traités prioritairement."
                />

                {/* Upload de pièces jointes */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-sm font-medium text-fg">
                    Pièces justificatives (facultatif)
                  </label>
                  <label className="border-2 border-dashed border-line rounded-lg p-5 flex flex-col items-center justify-center text-center hover:border-accent transition-colors cursor-pointer bg-surface-muted/40">
                    <Upload size={20} className="text-fg-muted mb-1.5" />
                    <span className="text-xs font-semibold text-fg">
                      Clique pour importer un fichier
                    </span>
                    <span className="text-[11px] text-fg-muted mt-0.5">
                      PDF, JPG ou PNG jusqu&apos;à 10 Mo
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  {fichiers.length > 0 && (
                    <div className="space-y-1 pt-2">
                      {fichiers.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-md bg-surface border border-line text-xs"
                        >
                          <span className="truncate max-w-[260px] font-medium text-fg">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-fg-muted hover:text-danger-fg p-1 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>

              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={goToPrevStep}
                  leftIcon={<ArrowLeft size={15} />}
                >
                  Retour
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={goToNextStep}
                  rightIcon={<ArrowRight size={15} />}
                >
                  Vérifier la demande
                </Button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 3 : RÉCAPITULATIF & VALIDATION */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-fg">
                  3. Récapitulatif avant transmission
                </h2>
                <p className="text-xs text-fg-muted">
                  Vérifie l&apos;exactitude des informations avant de valider.
                </p>
              </div>

              <GlassCard variant="glass" withShine={true} className="space-y-4">
                <div className="space-y-1 pb-3 border-b border-line/60">
                  <span className="text-xs text-fg-muted">Démarche sélectionnée</span>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-fg">
                      {selectedCategoryObj?.name || 'Démarche académique'}
                    </p>
                    {selectedCategoryObj?.is_auto_resolvable && (
                      <StatusBadge variant="info">Délivrance immédiate</StatusBadge>
                    )}
                  </div>
                </div>

                <div className="space-y-1 pb-3 border-b border-line/60">
                  <span className="text-xs text-fg-muted">Intitulé</span>
                  <p className="text-sm font-medium text-fg">{formData.titre}</p>
                </div>

                <div className="space-y-1 pb-3 border-b border-line/60">
                  <span className="text-xs text-fg-muted">Motif renseigné</span>
                  <p className="text-xs text-fg-secondary leading-relaxed whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>

                {fichiers.length > 0 && (
                  <div className="space-y-1 pb-3 border-b border-line/60">
                    <span className="text-xs text-fg-muted">Justificatifs joints</span>
                    <p className="text-xs text-fg font-medium">
                      {fichiers.length} fichier(s) attaché(s)
                    </p>
                  </div>
                )}

                {/* Prévisualisation de la frise initiale */}
                <div className="pt-2">
                  <span className="text-xs text-fg-muted block mb-2">
                    Circuit prévisionnel de traitement
                  </span>
                  <RequestTimeline
                    variant="compact"
                    statusSentence="Dès validation, ton dossier sera transmis au secrétariat académique."
                    steps={[
                      { id: '1', label: 'Dépôt immédiat', date: 'Aujourd’hui', status: 'current' },
                      { id: '2', label: 'Instruction', date: undefined, status: 'upcoming' },
                      { id: '3', label: 'Délivrance', date: undefined, status: 'upcoming' },
                    ]}
                  />
                </div>
              </GlassCard>

              <div className="flex items-center justify-between pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={goToPrevStep}
                  disabled={loading}
                  leftIcon={<ArrowLeft size={15} />}
                >
                  Modifier
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  leftIcon={<CheckCircle size={15} />}
                >
                  {selectedCategoryObj?.is_auto_resolvable
                    ? 'Générer mon attestation'
                    : 'Transmettre la demande'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

export default function NouvelleRequetePage() {
  return (
    <StudentLayout>
      <Suspense
        fallback={
          <div className="p-8 max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <NouvelleRequeteContent />
      </Suspense>
    </StudentLayout>
  );
}
