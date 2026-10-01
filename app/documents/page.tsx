'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText, Search,
  Calendar, CheckCircle, Home,
  FileCheck, ShieldCheck, QrCode, Eye, Printer, ArrowRight
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import OfficialDocumentModal from '@/components/OfficialDocumentModal';

const DEFAULT_DOCUMENTS = [
  {
    id: 'doc-1',
    code: 'CERT-IUC-2026-9812',
    type: 'attestation',
    titre: 'Attestation de scolarité officielle 2025-2026',
    description: 'Document certifié avec QR Code attestant l\'inscription régulière pour l\'année académique',
    date: '24 mars 2026',
    taille: '185 KB',
    statut: 'disponible',
    categorie: 'Scolarité',
    requesterName: 'Kevin Fotso',
    matricule: '22IUC01452',
    programOrFunction: 'L3 Génie Logiciel',
    academicYear: '2025-2026',
  },
  {
    id: 'doc-2',
    code: 'REL-IUC-2026-004',
    type: 'releve',
    titre: 'Relevé de notes officiel - Semestre 4',
    description: 'Relevé de notes semestriel certifié avec mention des crédits validés',
    date: '21 mars 2026',
    taille: '312 KB',
    statut: 'disponible',
    categorie: 'Notes',
    requesterName: 'Audrey Talla',
    matricule: '23IUC02981',
    programOrFunction: 'L2 Réseaux & Télécoms',
    academicYear: '2025-2026',
  },
  {
    id: 'doc-3',
    code: 'ATT-TRAV-2026-4410',
    type: 'attestation',
    titre: 'Attestation de travail & Prise de service',
    description: 'Attestation officielle pour membre du corps enseignant et personnel de l\'IUC',
    date: '25 mars 2026',
    taille: '190 KB',
    statut: 'disponible',
    categorie: 'RH & Personnel',
    requesterName: 'Mme Nicole Bilong',
    matricule: 'ENS-108',
    programOrFunction: 'Enseignante Vacataire (Algorithmique & BD)',
    academicYear: '2025-2026',
  }
];

const CATEGORIES = ['Tous', 'Scolarité', 'Notes', 'RH & Personnel'];

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('Tous');
  const [documents, setDocuments] = useState(DEFAULT_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('campuslite_user') || localStorage.getItem('iuc_user');
      if (stored) {
        const u = JSON.parse(stored);
        setDocuments(prev => prev.map(doc => {
          if (doc.type === 'attestation') {
            return {
              ...doc,
              requesterName: `${u.first_name} ${u.last_name}`,
              matricule: u.matricule || doc.matricule,
              programOrFunction: u.filiere || u.fonction || doc.programOrFunction,
            };
          }
          return doc;
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleOpenDoc = (doc: any) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const filtered = documents.filter(doc => {
    const matchSearch = !search || 
      doc.titre.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase()) ||
      doc.code.toLowerCase().includes(search.toLowerCase());
    const matchCategorie = categorie === 'Tous' || doc.categorie === categorie;
    return matchSearch && matchCategorie;
  });

  return (
    <StudentLayout>
      <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
        
        {/* Navigation fil d'Ariane */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/dashboard" className="hover:text-black transition-colors flex items-center gap-1">
            <Home size={13} />
            Portail
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-bold">Coffre-fort & Certificats</span>
        </div>

        {/* En-tête Monochrome */}
        <div className="bg-[#09090b] text-white rounded-xl p-6 sm:p-8 border border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-zinc-800 text-zinc-300 border border-zinc-700">
                <ShieldCheck size={13} />
                Documents Officiels Authentifiés
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Coffre-fort Numérique & Certificats
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Tous les documents délivrés via CampusLite comportent une signature numérique scellée et un QR Code de vérification infalsifiable vérifiable par les autorités, consulats et universités partenaires.
              </p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center shrink-0 min-w-[120px]">
              <p className="text-2xl font-bold font-mono text-white">{documents.length}</p>
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Certificats</p>
            </div>
          </div>
        </div>

        {/* Barre de recherche & Filtres */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher par titre ou référence QR (ex: CERT-CL)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-all font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategorie(cat)}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  categorie === cat
                    ? 'bg-black text-white shadow-2xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grille des documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((doc) => {
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                          {doc.code}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-800 border border-zinc-200 px-1.5 py-0.2 rounded font-bold flex items-center gap-1">
                          <CheckCircle size={10} /> Validé
                        </span>
                      </div>
                      <h3 className="font-bold text-zinc-900 text-sm">{doc.titre}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{doc.description}</p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {doc.date}
                    </span>
                    <span>•</span>
                    <span>{doc.taille}</span>
                    <span>•</span>
                    <span className="bg-zinc-50 border border-zinc-200 px-1.5 py-0.2 rounded text-zinc-600">{doc.categorie}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDoc(doc)}
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    <Printer size={13} />
                    Visualiser & Imprimer
                  </button>
                  <Link
                    href={`/verify/${doc.code}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-semibold text-xs rounded-lg transition-colors"
                  >
                    <QrCode size={13} />
                    Contrôle QR
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Modal du document officiel certifié */}
      {selectedDoc && (
        <OfficialDocumentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          document={selectedDoc}
        />
      )}
    </StudentLayout>
  );
}
