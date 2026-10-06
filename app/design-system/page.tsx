'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import GlassCard from '@/components/ui/GlassCard';
import StatTile from '@/components/ui/StatTile';
import RequestTimeline from '@/components/ui/RequestTimeline';
import DayTimeline from '@/components/ui/DayTimeline';
import ProgressRing from '@/components/ui/ProgressRing';
import MiniAreaChart from '@/components/ui/MiniAreaChart';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Sun, Moon, Sparkles, Check, ArrowRight, Eye, ShieldCheck } from 'lucide-react';

export default function DesignSystemPage() {
  const { theme, toggleTheme } = useTheme();
  const [ambiance, setAmbiance] = useState<'direction-a' | 'direction-b'>('direction-a');
  const [fontOption, setFontOption] = useState<'jakarta' | 'manrope'>('jakarta');

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-ambiance', ambiance);
  }, [ambiance]);

  const fontClass = fontOption === 'jakarta' ? 'font-title-jakarta' : 'font-title-manrope';

  return (
    <div className={`min-h-screen p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-12 ${fontClass}`}>
      {/* ── En-tête & Barre de Contrôle Interactive ── */}
      <div className="glass-raised p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-accent text-accent-fg font-semibold px-2 py-0.5 rounded-full">
              Laboratoire Design System
            </span>
            <span className="text-xs text-fg-muted">• CampusLite 2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">
            Système Visuel & Recettes de Verre
          </h1>
          <p className="text-sm text-fg-muted">
            Profondeur contrôlée, données réelles, typographie calibrée et mouvement utile.
          </p>
        </div>

        {/* Sélecteurs de Direction et Typographie */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sélecteur d'ambiance */}
          <div className="flex items-center p-1 rounded-md bg-surface-muted border border-line text-xs font-medium">
            <button
              type="button"
              onClick={() => setAmbiance('direction-a')}
              className={`px-3 py-1.5 rounded-md transition-colors-fast cursor-pointer ${
                ambiance === 'direction-a'
                  ? 'bg-surface text-fg font-semibold shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              Direction A (Bleu Azur)
            </button>
            <button
              type="button"
              onClick={() => setAmbiance('direction-b')}
              className={`px-3 py-1.5 rounded-md transition-colors-fast cursor-pointer ${
                ambiance === 'direction-b'
                  ? 'bg-surface text-fg font-semibold shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              Direction B (Indigo Nuit)
            </button>
          </div>

          {/* Sélecteur de Police */}
          <div className="flex items-center p-1 rounded-md bg-surface-muted border border-line text-xs font-medium">
            <button
              type="button"
              onClick={() => setFontOption('jakarta')}
              className={`px-3 py-1.5 rounded-md transition-colors-fast cursor-pointer ${
                fontOption === 'jakarta'
                  ? 'bg-surface text-fg font-semibold shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              Plus Jakarta Sans
            </button>
            <button
              type="button"
              onClick={() => setFontOption('manrope')}
              className={`px-3 py-1.5 rounded-md transition-colors-fast cursor-pointer ${
                fontOption === 'manrope'
                  ? 'bg-surface text-fg font-semibold shadow-xs'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              Manrope
            </button>
          </div>

          {/* Thème clair / sombre */}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleTheme}
            leftIcon={theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          >
            {theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
          </Button>
        </div>
      </div>

      {/* ── SECTION 1 : LES 2 DIRECTIONS D'AMBIANCE & COMPARATIF TYPO ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-fg tracking-tight">
          1. Comparatif des 2 Directions & Polices de Titre
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fiche Direction A */}
          <GlassCard
            className={`border-2 transition-all ${
              ambiance === 'direction-a' ? 'border-accent shadow-md' : 'border-line/40'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-line/60">
              <span className="text-sm font-semibold text-fg">
                Direction A : Bleu Azur & Verre Givré
              </span>
              {ambiance === 'direction-a' && (
                <span className="text-xs bg-accent text-accent-fg px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
            <ul className="text-xs text-fg-muted space-y-2 mt-3">
              <li>• Base #EEF2F9 (sombre #0B1020), orbes bleu royal (#1D4ED8) et cyan poudré (#0284C7).</li>
              <li>• Rendu très lumineux, cristallin et aéré (effet macOS Sonoma / Linear).</li>
              <li>• Reflet lumineux supérieur de 1px et ombres douces et amples.</li>
            </ul>
          </GlassCard>

          {/* Fiche Direction B */}
          <GlassCard
            className={`border-2 transition-all ${
              ambiance === 'direction-b' ? 'border-accent shadow-md' : 'border-line/40'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-line/60">
              <span className="text-sm font-semibold text-fg">
                Direction B : Bleu Nuit & Indigo Profond
              </span>
              {ambiance === 'direction-b' && (
                <span className="text-xs bg-accent text-accent-fg px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
            <ul className="text-xs text-fg-muted space-y-2 mt-3">
              <li>• Base #F1F4FA (sombre #080D1A), orbes bleu profond (#1E40AF) et indigo (#4338CA).</li>
              <li>• Rendu plus institutionnel, statutaire et feutré, contraste data maximal.</li>
              <li>• Densité de verre satiné avec saturation accrue.</li>
            </ul>
          </GlassCard>
        </div>

        {/* Comparatif Typo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="surface-solid p-5 space-y-2">
            <span className="text-xs font-semibold text-accent font-title-jakarta">
              Option 1 : Plus Jakarta Sans (Google Fonts)
            </span>
            <p className="text-2xl font-bold font-title-jakarta text-fg tracking-tight">
              Bonjour, Kevin Fotso — Semestre 5
            </p>
            <p className="text-3xl font-extrabold font-title-jakarta text-fg tabular">
              15.85 <span className="text-sm font-normal text-fg-muted">/ 20</span> • 22 / 30 ECTS
            </p>
            <p className="text-xs text-fg-muted">
              Moderne, géométrique, œil très ouvert, haute clarté sur les chiffres tabulaires SaaS.
            </p>
          </div>

          <div className="surface-solid p-5 space-y-2">
            <span className="text-xs font-semibold text-accent font-title-manrope">
              Option 2 : Manrope (Google Fonts)
            </span>
            <p className="text-2xl font-bold font-title-manrope text-fg tracking-tight">
              Bonjour, Kevin Fotso — Semestre 5
            </p>
            <p className="text-3xl font-extrabold font-title-manrope text-fg tabular">
              15.85 <span className="text-sm font-normal text-fg-muted">/ 20</span> • 22 / 30 ECTS
            </p>
            <p className="text-xs text-fg-muted">
              Néo-grotesque adoucie, équilibrée, chaleureuse, lisibilité remarquable en corps de texte.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 : LES 3 RECETTES DE VERRE DU DESIGN SYSTEM ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-fg tracking-tight">
          2. Les Trois Recettes de Verre (Sans Verre dans le Verre)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Verre Niveau 1 */}
          <GlassCard variant="glass" withShine={true}>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider font-mono">
              Recette 1 : Glass
            </span>
            <h3 className="text-base font-semibold text-fg mt-2">Cartes standard</h3>
            <p className="text-xs text-fg-muted mt-1 leading-relaxed">
              Fond 62% blanc en clair / 6% en sombre. Backdrop blur 20px, filet lumineux 1px en lisière haute. Rayon 16px.
            </p>
            <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs text-fg-secondary">
              <span>Opacité 62%</span>
              <span className="font-mono text-fg-muted">AA 6.7:1</span>
            </div>
          </GlassCard>

          {/* Verre Niveau 2 */}
          <GlassCard variant="glass-raised">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider font-mono">
              Recette 2 : Glass-Raised
            </span>
            <h3 className="text-base font-semibold text-fg mt-2">Surfaces surélevées</h3>
            <p className="text-xs text-fg-muted mt-1 leading-relaxed">
              Fond 82% blanc en clair / 11% en sombre. Blur 24px, ombre overlay marquée. Réservé aux barres de nav et popovers.
            </p>
            <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs text-fg-secondary">
              <span>Opacité 82%</span>
              <span className="font-mono text-fg-muted">AA 8.2:1</span>
            </div>
          </GlassCard>

          {/* Surface Niveau 3 */}
          <GlassCard variant="solid">
            <span className="text-xs font-semibold text-fg-secondary uppercase tracking-wider font-mono">
              Recette 3 : Solid
            </span>
            <h3 className="text-base font-semibold text-fg mt-2">Tableaux & Formulaires</h3>
            <p className="text-xs text-fg-muted mt-1 leading-relaxed">
              Surface 100% opaque. Pas de blur. Assure une lisibilité absolue pour les tableaux denses et la saisie de texte.
            </p>
            <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs text-fg-secondary">
              <span>Opaque 100%</span>
              <span className="font-mono text-fg-muted">AA 17.2:1</span>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── SECTION 3 : ÉLÉMENTS SIGNATURES ── */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-fg tracking-tight">
          3. Éléments Signatures : DayTimeline & RequestTimeline
        </h2>

        {/* Signature 1 : DayTimeline */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-fg">
              Signature A : Frise de la Journée (DayTimeline)
            </h3>
            <p className="text-xs text-fg-muted">
              Positionnement dynamique des cours entre 7h et 19h avec marqueur en temps réel.
            </p>
          </div>

          <DayTimeline
            currentTimeString="09:15"
            slots={[
              {
                id: '1',
                courseName: 'Architecture des Systèmes Cloud',
                roomName: 'Amphi 500',
                startTime: '08:00',
                endTime: '10:00',
                teacherName: 'Dr. Samuel Ewane',
                status: 'current',
              },
              {
                id: '2',
                courseName: 'Génie Logiciel & Agilité',
                roomName: 'Salle B204',
                startTime: '10:15',
                endTime: '12:15',
                teacherName: 'Mme. Carole Nguena',
                status: 'upcoming',
              },
              {
                id: '3',
                courseName: 'Bases de Données Avancées',
                roomName: 'Lab Info 3',
                startTime: '14:00',
                endTime: '16:00',
                teacherName: 'M. Fabrice Mbida',
                status: 'upcoming',
              },
            ]}
          />
        </GlassCard>

        {/* Signature 2 : RequestTimeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-base font-semibold text-fg mb-1">
              Signature B : RequestTimeline (Version Compacte)
            </h3>
            <p className="text-xs text-fg-muted mb-4">
              Pour l&apos;accueil, les notifications et la liste des requêtes.
            </p>

            <RequestTimeline
              variant="compact"
              statusSentence="Reçue lundi. En cours d'instruction par la scolarité. Réponse sous 48h."
              steps={[
                { id: '1', label: 'Déposée', date: 'Lun 12', status: 'completed' },
                { id: '2', label: 'Instruction', date: 'Mar 13', status: 'current' },
                { id: '3', label: 'Résolue', date: undefined, status: 'upcoming' },
              ]}
            />
          </GlassCard>

          <GlassCard>
            <h3 className="text-base font-semibold text-fg mb-1">
              Signature B : RequestTimeline (Version Détaillée)
            </h3>
            <p className="text-xs text-fg-muted mb-4">
              Pour la fiche détaillée d&apos;une requête.
            </p>

            <RequestTimeline
              variant="detailed"
              statusSentence="Dossier validé et scellé numériquement avec QR code."
              steps={[
                { id: '1', label: 'Demande déposée en ligne', date: '12 Octobre 2026 à 08:30', status: 'completed' },
                { id: '2', label: 'Prise en charge par le secrétariat', date: '12 Octobre 2026 à 11:15', status: 'completed' },
                { id: '3', label: 'Attestation certifiée et prête', date: '13 Octobre 2026 à 14:00', status: 'current' },
              ]}
            />
          </GlassCard>
        </div>
      </section>

      {/* ── SECTION 4 : GRAPHIQUES ET CHIFFRES CLÉS ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-fg tracking-tight">
          4. Graphiques & Chiffres Héros
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Moyenne générale"
            value="15.8"
            suffix="/ 20"
            numericValue={15.8}
            variation={{ text: '+1.2 pt vs S4', positive: true }}
            context="Semestre 5"
            interactive={true}
          />

          <StatTile
            label="Requêtes déposées"
            value="4"
            numericValue={4}
            variation={{ text: '100% traitées', positive: true }}
            context="Aucun retard SLA"
            interactive={true}
          />

          {/* Anneau de progression */}
          <GlassCard className="flex items-center justify-center p-4">
            <ProgressRing value={22} total={30} label="Crédits L3 validés" size={96} />
          </GlassCard>

          {/* Mini-courbe de semestre */}
          <GlassCard className="flex flex-col justify-between p-4">
            <div>
              <p className="text-xs text-fg-muted">Évolution des semestres</p>
              <p className="text-sm font-semibold text-fg">Progression constante</p>
            </div>
            <MiniAreaChart
              height={90}
              data={[
                { label: 'S1', value: 13.8 },
                { label: 'S2', value: 14.2 },
                { label: 'S3', value: 14.6 },
                { label: 'S4', value: 15.0 },
                { label: 'S5', value: 15.8 },
              ]}
            />
          </GlassCard>
        </div>
      </section>

      {/* ── SECTION 5 : COMPOSANTS INTERFACE ET FORMULAIRES ── */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-fg tracking-tight">
          5. Composants UI & États Interactifs
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Boutons et Badges */}
          <GlassCard className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-fg">Boutons standardisés</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="primary">Principal plein</Button>
                <Button variant="secondary">Secondaire verre</Button>
                <Button variant="ghost">Discret (Ghost)</Button>
                <Button variant="destructive">Destructif</Button>
                <Button variant="primary" isLoading>Chargement</Button>
                <Button variant="secondary" disabled>Désactivé</Button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-line/60">
              <h3 className="text-sm font-semibold text-fg">Badges de statut doux</h3>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge variant="success">Résolue & Validée</StatusBadge>
                <StatusBadge variant="warning">En attente d&apos;instruction</StatusBadge>
                <StatusBadge variant="danger">Rejetée</StatusBadge>
                <StatusBadge variant="info">En cours de traitement</StatusBadge>
                <StatusBadge variant="neutral">Archivée</StatusBadge>
              </div>
            </div>
          </GlassCard>

          {/* Formulaires denses */}
          <GlassCard variant="solid" className="space-y-4">
            <h3 className="text-sm font-semibold text-fg">Champs de saisie (Surface Solid)</h3>
            <Input
              label="Référence ou intitulé de la requête"
              placeholder="Ex: REQ-2026-0412"
              helperText="Format standardisé avec préfixe officiel"
            />
            <Select
              label="Type de démarche académique"
              options={[
                { value: 'attestation', label: 'Attestation de scolarité officielle' },
                { value: 'note', label: 'Contestation de note CC / SN' },
                { value: 'releve', label: 'Relevé de notes officiel' },
              ]}
            />
          </GlassCard>
        </div>

        {/* Tableau Solid */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-fg">Tableau dense (Surface Solid)</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Objet de la démarche</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">REQ-2026-0091</TableCell>
                <TableCell className="font-medium">Attestation de scolarité pour visa</TableCell>
                <TableCell className="text-fg-muted text-xs tabular">12 Octobre 2026</TableCell>
                <TableCell>
                  <StatusBadge variant="success">Délivrée</StatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Consulter</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">REQ-2026-0104</TableCell>
                <TableCell className="font-medium">Réclamation note Examen INF302</TableCell>
                <TableCell className="text-fg-muted text-xs tabular">10 Octobre 2026</TableCell>
                <TableCell>
                  <StatusBadge variant="info">En instruction</StatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Détails</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
