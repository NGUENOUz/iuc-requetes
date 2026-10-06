'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  FileCheck,
  Printer,
  ExternalLink,
  Plus,
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';
import { useStudent } from '@/lib/hooks';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

export default function DocumentsPage() {
  const { student } = useStudent();
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const studentName = student ? `${student.first_name} ${student.last_name}` : 'Étudiant';
  const matricule = student?.matricule || '—';
  const filiere = `${student?.filiere || 'Génie Logiciel'} (${student?.niveau || 'L3'})`;

  const documents = [
    {
      id: 'doc-1',
      code: 'CERT-IUC-2026-9812',
      type: 'attestation',
      titre: 'Attestation de scolarité officielle',
      description: 'Document officiel attestant de l’inscription régulière pour l’année académique en cours.',
      date: '24 mars 2026',
      taille: '185 KB',
      statut: 'disponible',
      categorie: 'Scolarité',
      requesterName: studentName,
      matricule: matricule,
      programOrFunction: filiere,
      academicYear: student?.annee_academique || '2025-2026',
    },
    {
      id: 'doc-2',
      code: 'REL-IUC-2026-004',
      type: 'releve',
      titre: 'Relevé de notes officiel — Semestre 4',
      description: 'Relevé de notes semestriel certifié avec mention des crédits ECTS validés.',
      date: '21 mars 2026',
      taille: '312 KB',
      statut: 'disponible',
      categorie: 'Notes',
      requesterName: studentName,
      matricule: matricule,
      programOrFunction: filiere,
      academicYear: student?.annee_academique || '2025-2026',
    },
  ];

  const filtered = documents.filter((doc) => {
    const q = search.toLowerCase();
    return (
      !q ||
      doc.titre.toLowerCase().includes(q) ||
      doc.code.toLowerCase().includes(q) ||
      doc.categorie.toLowerCase().includes(q)
    );
  });

  return (
    <StudentLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-line">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
              Coffre-fort des documents certifiés
            </h1>
            <p className="text-xs text-fg-muted">
              Consulte et télécharge tes attestations et reçus officiels scellés avec QR code.
            </p>
          </div>

          <Link href="/nouvelle-requete">
            <Button variant="primary" leftIcon={<Plus size={15} />}>
              Demander un document
            </Button>
          </Link>
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-md">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Rechercher par intitulé ou référence (ex: CERT-2026)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md bg-surface border border-line text-xs text-fg placeholder:text-fg-muted focus:border-accent focus-visible:outline-2 focus-visible:outline-accent transition-colors-fast"
          />
        </div>

        {/* Liste des documents */}
        {filtered.length === 0 ? (
          <GlassCard>
            <EmptyState
              title="Aucun document trouvé"
              description="Aucun justificatif officiel ne correspond à ta recherche."
              action={
                <Button variant="secondary" size="sm" onClick={() => setSearch('')}>
                  Réinitialiser la recherche
                </Button>
              }
            />
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((doc) => (
              <GlassCard key={doc.id} variant="glass" withShine={true} className="p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-fg-muted">
                      {doc.code}
                    </span>
                    <StatusBadge variant="success">Certifié</StatusBadge>
                  </div>

                  <h2 className="text-base font-bold text-fg">
                    {doc.titre}
                  </h2>

                  <p className="text-xs text-fg-muted leading-relaxed">
                    {doc.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-fg-secondary pt-1 font-mono">
                    <span>{doc.categorie}</span>
                    <span>•</span>
                    <span>{doc.taille}</span>
                    <span>•</span>
                    <span>Délivré le {doc.date}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-line/60 flex items-center justify-between">
                  <Link
                    href={`/verify/${doc.code}`}
                    target="_blank"
                    className="text-xs text-fg-secondary hover:text-accent font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={13} />
                    Contrôle QR
                  </Link>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedDoc(doc)}
                    leftIcon={<Printer size={14} />}
                  >
                    Consulter
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'affichage du document officiel */}
      {selectedDoc && (
        <OfficialDocumentModal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          document={{
            type: selectedDoc.type,
            title: selectedDoc.titre,
            code: selectedDoc.code,
            date: selectedDoc.date,
            requesterName: selectedDoc.requesterName,
            matricule: selectedDoc.matricule,
            programOrFunction: selectedDoc.programOrFunction,
            academicYear: selectedDoc.academicYear,
          }}
        />
      )}
    </StudentLayout>
  );
}
