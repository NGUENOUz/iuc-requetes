import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Award, Calendar, User, FileText, ArrowLeft } from 'lucide-react';
import { getLocalDB } from '@/lib/db/json-db';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';

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
    <div className="min-h-screen bg-bg text-fg flex flex-col justify-between p-4 sm:p-8 font-sans transition-colors">
      
      {/* En-tête Institutionnel */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent text-accent-fg flex items-center justify-center font-black text-sm tracking-tighter">
            CL
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-fg leading-none font-title">
              CampusLite
            </h1>
            <p className="text-[10px] text-fg-muted mt-1 font-medium">
              Registre Public de Vérification Numérique
            </p>
          </div>
        </div>

        <Link href="/">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={13} />}>
            Accueil
          </Button>
        </Link>
      </header>

      {/* Conteneur de Vérification */}
      <main className="max-w-xl mx-auto w-full my-8">
        <GlassCard variant="glass-raised" className="p-6 sm:p-8 space-y-6">
          
          {request ? (
            <div className="space-y-6">
              
              {/* Sceau d'Authenticité */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-line">
                <div className="w-14 h-14 rounded-full bg-accent text-accent-fg flex items-center justify-center mb-3 shadow-md">
                  <ShieldCheck size={28} />
                </div>

                <StatusBadge variant="success" className="mb-2">
                  Document Authentique & Scellé
                </StatusBadge>

                <h2 className="text-xl font-bold tracking-tight text-fg font-title">
                  {category?.name || 'Attestation Officielle CampusLite'}
                </h2>

                <p className="text-xs text-fg-muted mt-1 font-mono">
                  CODE VÉRIFICATION : <span className="text-fg font-bold">{code}</span>
                </p>
              </div>

              {/* Fiche d'identification */}
              <div className="space-y-3 bg-surface-muted/60 rounded-xl p-4 border border-line text-xs">
                
                <div className="flex items-center justify-between py-1.5 border-b border-line/60">
                  <span className="text-fg-muted text-[11px] flex items-center gap-1.5">
                    <User size={13} className="text-fg-secondary" /> Bénéficiaire
                  </span>
                  <span className="font-bold text-fg">
                    {student ? `${student.first_name} ${student.last_name}` : 'Titulaire certifié'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-line/60">
                  <span className="text-fg-muted text-[11px] flex items-center gap-1.5">
                    <Award size={13} className="text-fg-secondary" /> Identifiant / Matricule
                  </span>
                  <span className="font-mono font-bold text-fg">
                    {student?.matricule || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-line/60">
                  <span className="text-fg-muted text-[11px] flex items-center gap-1.5">
                    <FileText size={13} className="text-fg-secondary" /> Filière / Faculté
                  </span>
                  <span className="font-semibold text-fg">
                    {student?.filiere || student?.fonction || 'Institut Universitaire de la Côte'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-fg-muted text-[11px] flex items-center gap-1.5">
                    <Calendar size={13} className="text-fg-secondary" /> Date de délivrance
                  </span>
                  <span className="text-fg font-mono">
                    {formattedDate}
                  </span>
                </div>

              </div>

              {/* Mention légale d'intégrité */}
              <div className="p-3.5 rounded-lg bg-surface border border-line text-xs text-fg-secondary flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-success-fg shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  Ce document a fait l&apos;objet d&apos;un scellement cryptographique et certifie l&apos;authenticité des données inscrites dans le système académique CampusLite.
                </p>
              </div>

              <div className="pt-1">
                <Link href="/">
                  <Button variant="primary" fullWidth>
                    Accéder au portail CampusLite
                  </Button>
                </Link>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-surface-muted text-fg-muted flex items-center justify-center mx-auto">
                <FileText size={24} />
              </div>
              <h2 className="text-lg font-bold text-fg font-title">Vérification du document</h2>
              <p className="text-xs text-fg-muted max-w-sm mx-auto">
                Le document associé au code <span className="font-mono text-fg font-bold">{code}</span> est archivé dans le registre de certification CampusLite.
              </p>
              <Link href="/">
                <Button variant="ghost" size="sm" className="mt-2">
                  ← Retour à l&apos;accueil
                </Button>
              </Link>
            </div>
          )}

        </GlassCard>
      </main>

      {/* Pied de page */}
      <footer className="max-w-4xl mx-auto w-full text-center pt-6 border-t border-line text-[11px] text-fg-muted font-mono">
        <p>© {new Date().getFullYear()} CampusLite • Registre Central Universitaire</p>
      </footer>

    </div>
  );
}
