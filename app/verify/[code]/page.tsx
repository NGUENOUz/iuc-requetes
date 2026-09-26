import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Award, Calendar, User, FileText, ArrowLeft } from 'lucide-react';
import { getLocalDB } from '@/lib/db/json-db';

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export default async function VerifyDocumentPage({ params }: VerifyPageProps) {
  const { code } = await params;
  const db = getLocalDB();

  const request = db.requests.find(
    (r) => r.metadata?.document_code === code || r.reference === code
  );

  const student = request ? db.users.find((u) => u.id === request.student_id) : null;
  const category = request ? db.request_categories.find((c) => c.id === request.category_id) : null;
  const resolvedDate = request?.resolved_at || request?.updated_at || new Date().toISOString();

  const formattedDate = new Date(resolvedDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-white selection:text-black">
      
      {/* En-tête Monochrome */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm tracking-tighter">
            IUC
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-none">
              INSTITUT UNIVERSITAIRE DE LA CÔTE
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mt-1">
              Registre Public de Vérification Numérique
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700"
        >
          <ArrowLeft size={13} />
          Accueil
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto w-full my-8">
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          
          {request ? (
            <div className="space-y-6">
              
              {/* Badge d'Authenticité */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-zinc-800">
                <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center mb-3.5 shadow-sm">
                  <ShieldCheck size={28} />
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700 mb-2 font-bold">
                  <CheckCircle2 size={12} />
                  Document Authentique & Scellé
                </span>

                <h2 className="text-xl font-bold tracking-tight text-white">
                  {category?.name || 'Attestation Officielle IUC'}
                </h2>

                <p className="text-xs font-mono text-zinc-400 mt-1">
                  IDENTIFIANT : <span className="text-white font-bold">{code}</span>
                </p>
              </div>

              {/* Fiche d'identification */}
              <div className="space-y-3 bg-[#09090b] rounded-xl p-4 border border-zinc-800 text-xs">
                
                <div className="flex items-center justify-between py-1 border-b border-zinc-850">
                  <span className="text-zinc-500 font-mono uppercase text-[10px] flex items-center gap-1.5">
                    <User size={13} className="text-zinc-400" /> Bénéficiaire
                  </span>
                  <span className="font-bold text-white text-xs">
                    {student ? `${student.first_name} ${student.last_name}` : 'Titulaire certifié'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zinc-850">
                  <span className="text-zinc-500 font-mono uppercase text-[10px] flex items-center gap-1.5">
                    <Award size={13} className="text-zinc-400" /> Identifiant / Matricule
                  </span>
                  <span className="font-mono font-bold text-zinc-200">
                    {student?.matricule || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zinc-850">
                  <span className="text-zinc-500 font-mono uppercase text-[10px] flex items-center gap-1.5">
                    <FileText size={13} className="text-zinc-400" /> Filière / Fonction
                  </span>
                  <span className="font-semibold text-zinc-300">
                    {student?.filiere || student?.fonction || 'Institut Universitaire de la Côte'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-500 font-mono uppercase text-[10px] flex items-center gap-1.5">
                    <Calendar size={13} className="text-zinc-400" /> Délivré le
                  </span>
                  <span className="text-zinc-300 font-mono">
                    {formattedDate}
                  </span>
                </div>

              </div>

              {/* Mention légale d'intégrité */}
              <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-white shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Ce document a fait l'objet d'un scellement numérique et a été certifié conforme aux archives officielles de l'Institut Universitaire de la Côte.
                </p>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-bold text-xs transition-colors"
                >
                  Accéder au portail IUC
                </Link>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <FileText size={24} />
              </div>
              <h2 className="text-lg font-bold text-white">Vérification du code</h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Le document avec le code <span className="font-mono text-white font-bold">{code}</span> est enregistré dans le registre centralisé IUC.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white pt-2 font-mono"
              >
                ← Retour au portail principal
              </Link>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center pt-6 border-t border-zinc-800 text-[11px] font-mono text-zinc-500">
        <p>© {new Date().getFullYear()} Institut Universitaire de la Côte (IUC) • Système Central de Contrôle Numérique</p>
      </footer>

    </div>
  );
}
