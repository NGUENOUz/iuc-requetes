'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Shield,
  Save,
  Edit2,
  Check,
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import { useStudent } from '@/lib/hooks';
import GlassCard from '@/components/ui/GlassCard';
import Avatar from '@/components/ui/Avatar';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function ProfilPage() {
  const { student, loading } = useStudent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    telephone: '+237 6 XX XX XX XX',
    adresse: 'Campus Principal, Douala',
  });
  const [saving, setSaving] = useState(false);

  const fullName = student
    ? `${student.first_name} ${student.last_name}`
    : 'Étudiant';

  const matricule = student?.matricule || '—';
  const roleCode = student?.role_code || 'etudiant';
  const filiere = student?.filiere || 'Génie Logiciel';
  const niveau = student?.niveau || 'L3';
  const annee = student?.annee_academique || '2025-2026';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaving(false);
    setIsEditing(false);
    toast.success('Coordonnées mises à jour avec succès');
  };

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
        {/* En-tête de profil */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-line">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
              Profil utilisateur & identifiants
            </h1>
            <p className="text-xs text-fg-muted">
              Informations académiques et coordonnées officielles de l’étudiant.
            </p>
          </div>

          <Button
            variant={isEditing ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            leftIcon={isEditing ? <Check size={14} /> : <Edit2 size={14} />}
          >
            {isEditing ? 'Annuler' : 'Modifier mes coordonnées'}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Carte Identité Hero en Verre */}
            <GlassCard variant="glass" withShine={true} className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <Avatar
                  src={student?.avatar_url}
                  name={fullName}
                  size="lg"
                  className="w-16 h-16 text-xl"
                />

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-fg-muted">
                      {matricule}
                    </span>
                    <StatusBadge variant="info">
                      {roleCode === 'enseignant'
                        ? 'Enseignant'
                        : roleCode === 'personnel'
                        ? 'Personnel'
                        : 'Compte Étudiant'}
                    </StatusBadge>
                    <StatusBadge variant="success">Inscrit en règle</StatusBadge>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-fg tracking-tight">
                    {fullName}
                  </h2>

                  <p className="text-xs text-fg-secondary">
                    {filiere} • {niveau} • Année {annee}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Informations détaillées en 2 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations académiques */}
              <GlassCard variant="solid" className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-line/60">
                  <GraduationCap size={16} className="text-accent" />
                  <h3 className="text-sm font-semibold text-fg">
                    Cursus & scolarité
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-fg-muted block mb-0.5">Filière / Programme</span>
                    <span className="font-semibold text-fg text-sm">{filiere}</span>
                  </div>
                  <div>
                    <span className="text-fg-muted block mb-0.5">Niveau d&apos;étude</span>
                    <span className="font-semibold text-fg text-sm">{niveau}</span>
                  </div>
                  <div>
                    <span className="text-fg-muted block mb-0.5">Année académique</span>
                    <span className="font-semibold text-fg tabular text-sm">{annee}</span>
                  </div>
                  <div>
                    <span className="text-fg-muted block mb-0.5">Établissement</span>
                    <span className="font-semibold text-fg text-sm">
                      Campus Universitaire Principal
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Coordonnées */}
              <GlassCard variant="solid" className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-line/60">
                  <Shield size={16} className="text-accent" />
                  <h3 className="text-sm font-semibold text-fg">
                    Coordonnées de contact
                  </h3>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSave} className="space-y-3 text-xs">
                    <Input
                      label="Téléphone"
                      value={formData.telephone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, telephone: e.target.value }))
                      }
                    />
                    <Input
                      label="Adresse de résidence"
                      value={formData.adresse}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, adresse: e.target.value }))
                      }
                    />
                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={saving}
                        leftIcon={<Save size={14} />}
                      >
                        Enregistrer
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-fg-muted block mb-0.5">Email institutionnel</span>
                      <span className="font-semibold text-fg text-sm font-mono">
                        {student?.email || 'etudiant@campuslite.edu'}
                      </span>
                    </div>
                    <div>
                      <span className="text-fg-muted block mb-0.5">Téléphone</span>
                      <span className="font-semibold text-fg text-sm tabular">
                        {formData.telephone}
                      </span>
                    </div>
                    <div>
                      <span className="text-fg-muted block mb-0.5">Adresse de résidence</span>
                      <span className="font-semibold text-fg text-sm">
                        {formData.adresse}
                      </span>
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
