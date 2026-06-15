'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, FileText, Download, Eye, Search, Filter,
  Calendar, CheckCircle, Clock, AlertCircle, Home, File,
  FileCheck, Award, Folder
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';

const DOCUMENTS = [
  {
    id: 1,
    type: 'attestation',
    titre: 'Attestation de scolarité 2024-2025',
    description: 'Attestation certifiant votre inscription pour l\'année académique en cours',
    date: '15 mai 2025',
    taille: '245 KB',
    statut: 'disponible',
    categorie: 'Scolarité',
  },
  {
    id: 2,
    type: 'releve',
    titre: 'Relevé de notes - Semestre 1',
    description: 'Relevé de notes du premier semestre 2024-2025',
    date: '10 mai 2025',
    taille: '312 KB',
    statut: 'disponible',
    categorie: 'Notes',
  },
  {
    id: 3,
    type: 'attestation',
    titre: 'Attestation d\'inscription',
    description: 'Attestation d\'inscription pour l\'année 2024-2025',
    date: '05 mai 2025',
    taille: '198 KB',
    statut: 'disponible',
    categorie: 'Scolarité',
  },
  {
    id: 4,
    type: 'certificat',
    titre: 'Certificat de réussite - Licence 2',
    description: 'Certificat de réussite niveau Licence 2',
    date: '28 avril 2025',
    taille: '456 KB',
    statut: 'disponible',
    categorie: 'Diplômes',
  },
  {
    id: 5,
    type: 'releve',
    titre: 'Relevé de notes - Semestre 2 (2023-2024)',
    description: 'Relevé de notes du deuxième semestre 2023-2024',
    date: '20 avril 2025',
    taille: '298 KB',
    statut: 'disponible',
    categorie: 'Notes',
  },
  {
    id: 6,
    type: 'attestation',
    titre: 'Attestation de non-exclusion',
    description: 'Attestation certifiant la non-exclusion disciplinaire',
    date: '12 avril 2025',
    taille: '187 KB',
    statut: 'en_attente',
    categorie: 'Scolarité',
  },
];

const CATEGORIES = ['Tous', 'Scolarité', 'Notes', 'Diplômes'];

const typeIcon = {
  attestation: FileCheck,
  releve: FileText,
  certificat: Award,
};

const typeColor = {
  attestation: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
  releve: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
  certificat: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
};

const statutStyle = {
  disponible: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  en_attente: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
};

function DocumentsContent() {
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('Tous');

  const filtered = DOCUMENTS.filter(doc => {
    const matchSearch = !search || 
      doc.titre.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase());
    const matchCategorie = categorie === 'Tous' || doc.categorie === categorie;
    return matchSearch && matchCategorie;
  });

  const stats = {
    total: DOCUMENTS.length,
    disponibles: DOCUMENTS.filter(d => d.statut === 'disponible').length,
    en_attente: DOCUMENTS.filter(d => d.statut === 'en_attente').length,
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
        <span className="text-slate-900 font-medium">Documents</span>
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Folder size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Mes documents</h1>
            <p className="text-blue-100 text-sm">Téléchargez vos attestations, relevés et certificats</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="text-center">
            <p className="text-2xl font-black">{stats.total}</p>
            <p className="text-xs text-blue-100">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black">{stats.disponibles}</p>
            <p className="text-xs text-blue-100">Disponibles</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black">{stats.en_attente}</p>
            <p className="text-xs text-blue-100">En attente</p>
          </div>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un document..."
              className="w-full h-10 bg-slate-50 rounded-xl pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 border-t">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategorie(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categorie === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border shadow-sm p-12 text-center">
            <File size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-semibold">Aucun document trouvé</p>
            <p className="text-sm text-slate-400 mt-1">Modifiez vos filtres ou effectuez une autre recherche.</p>
          </div>
        ) : (
          filtered.map((doc) => {
            const Icon = typeIcon[doc.type as keyof typeof typeIcon];
            const colors = typeColor[doc.type as keyof typeof typeColor];
            const StatutIcon = statutStyle[doc.statut as keyof typeof statutStyle].icon;
            const statutColors = statutStyle[doc.statut as keyof typeof statutStyle];

            return (
              <div key={doc.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icône du type */}
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={24} className={colors.icon} />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-sm">{doc.titre}</h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${statutColors.bg} ${statutColors.text}`}>
                          <StatutIcon size={10} />
                          {doc.statut === 'disponible' ? 'Disponible' : 'En attente'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 mb-3">{doc.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {doc.date}
                        </span>
                        <span>•</span>
                        <span>{doc.taille}</span>
                        <span>•</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{doc.categorie}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {doc.statut === 'disponible' ? (
                          <>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
                              <Download size={12} />
                              Télécharger
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">
                              <Eye size={12} />
                              Aperçu
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-yellow-700">
                            <AlertCircle size={14} />
                            <span>Document en cours de génération</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-900 mb-1">Besoin d'un document ?</p>
            <p className="text-sm text-blue-700">
              Si vous ne trouvez pas un document dont vous avez besoin, vous pouvez faire une demande via{' '}
              <Link href="/nouvelle-requete" className="font-bold underline hover:text-blue-800">
                une nouvelle requête
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <StudentLayout>
      <DocumentsContent />
    </StudentLayout>
  );
}
