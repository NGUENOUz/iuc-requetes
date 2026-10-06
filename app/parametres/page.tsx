'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield, Bell, Lock, Mail, Smartphone,
  Settings, LogOut, Trash2, AlertCircle, Save, CheckCircle2,
  ChevronRight, Laptop, Moon, Sun, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import StudentLayout from '../components/StudentLayout';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

export default function ParametresPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'preferences'>('security');

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    requeteCreee: true,
    requeteTraitee: true,
    nouveauMessage: true,
    rappels: true,
  });

  const [preferences, setPreferences] = useState({
    langue: 'fr',
  });

  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error('Le mot de passe doit comporter au moins 8 caractères');
      return;
    }

    setSavingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSavingPassword(false);
    toast.success('Mot de passe mis à jour avec succès');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success('Préférence de notification mise à jour');
      return updated;
    });
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSavingPrefs(false);
    toast.success('Préférences enregistrées');
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Fil d'Ariane & En-tête */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <Link href="/dashboard" className="hover:text-fg transition-colors">
              Tableau de bord
            </Link>
            <span>/</span>
            <span className="text-fg font-medium">Paramètres</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-fg tracking-tight">
                Paramètres du compte
              </h1>
              <p className="text-xs text-fg-muted">
                Sécurité d&apos;accès, alertes académiques et préférences d&apos;affichage
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>
                Retour
              </Button>
            </Link>
          </div>
        </div>

        {/* Disposition Principale en 2 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* ── Navigation Latérale des Onglets ── */}
          <div className="md:col-span-4 space-y-4">
            <GlassCard variant="glass" className="p-2 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-accent text-accent-fg shadow-xs'
                    : 'text-fg-secondary hover:text-fg hover:bg-surface-muted/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield size={16} />
                  <span>Sécurité & Accès</span>
                </div>
                <ChevronRight size={14} className="opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'bg-accent text-accent-fg shadow-xs'
                    : 'text-fg-secondary hover:text-fg hover:bg-surface-muted/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell size={16} />
                  <span>Notifications</span>
                </div>
                <ChevronRight size={14} className="opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'preferences'
                    ? 'bg-accent text-accent-fg shadow-xs'
                    : 'text-fg-secondary hover:text-fg hover:bg-surface-muted/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings size={16} />
                  <span>Préférences & Thème</span>
                </div>
                <ChevronRight size={14} className="opacity-60" />
              </button>
            </GlassCard>

            {/* Déconnexion rapide */}
            <GlassCard variant="glass" className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-muted border border-line flex items-center justify-center shrink-0 text-fg">
                  <LogOut size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-fg">Fin de session</h4>
                  <p className="text-[11px] text-fg-muted mt-0.5">
                    Déconnectez-vous de manière sécurisée de cet appareil.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={handleLogout}
                leftIcon={<LogOut size={13} />}
              >
                Se déconnecter
              </Button>
            </GlassCard>

            {/* Zone de Danger */}
            <GlassCard variant="glass" className="p-4 border-danger/30 space-y-2">
              <div className="flex items-center gap-2 text-danger-fg text-xs font-semibold">
                <AlertCircle size={15} />
                <span>Zone administrative</span>
              </div>
              <p className="text-[11px] text-fg-muted">
                La clôture définitive ou la purge du compte nécessite l&apos;accord de la scolarité centrale.
              </p>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => toast.info('Veuillez contacter le bureau de la scolarité pour toute clôture de dossier')}
                leftIcon={<Trash2 size={13} />}
              >
                Demande de désactivation
              </Button>
            </GlassCard>
          </div>

          {/* ── Contenu de l'onglet actif ── */}
          <div className="md:col-span-8 space-y-6">
            
            {/* ONGLET 1 : SÉCURITÉ */}
            {activeTab === 'security' && (
              <GlassCard variant="glass" withShine={true} className="p-5 sm:p-6 space-y-6">
                <div className="pb-4 border-b border-line/60">
                  <h2 className="text-base font-bold text-fg">Changement de mot de passe</h2>
                  <p className="text-xs text-fg-muted mt-0.5">
                    Utilisez au minimum 8 caractères incluant chiffres et symboles.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Input
                    label="Mot de passe actuel"
                    type="password"
                    placeholder="••••••••••••"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                    leftIcon={<Lock size={15} />}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nouveau mot de passe"
                      type="password"
                      placeholder="Minimum 8 caractères"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, new: e.target.value }))}
                      leftIcon={<Lock size={15} />}
                      required
                    />

                    <Input
                      label="Confirmer le nouveau mot de passe"
                      type="password"
                      placeholder="Répétez le mot de passe"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                      leftIcon={<Lock size={15} />}
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={savingPassword}
                      leftIcon={<Save size={14} />}
                    >
                      Enregistrer le mot de passe
                    </Button>
                  </div>
                </form>

                {/* Historique de session */}
                <div className="pt-6 border-t border-line/60 space-y-3">
                  <h3 className="text-xs font-semibold text-fg">Session active</h3>
                  <div className="p-3 rounded-lg bg-surface-muted/60 border border-line flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Laptop size={16} className="text-fg-muted" />
                      <div>
                        <p className="font-semibold text-fg">Navigateur Web actuel</p>
                        <p className="text-[11px] text-fg-muted font-mono">Dernière activité il y a quelques instants</p>
                      </div>
                    </div>
                    <StatusBadge variant="success">Active</StatusBadge>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* ONGLET 2 : NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <GlassCard variant="glass" withShine={true} className="p-5 sm:p-6 space-y-6">
                <div className="pb-4 border-b border-line/60">
                  <h2 className="text-base font-bold text-fg">Canaux de notification</h2>
                  <p className="text-xs text-fg-muted mt-0.5">
                    Définissez comment vous souhaitez être averti des réponses de l&apos;administration.
                  </p>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => handleNotificationToggle('email')}
                    className="p-3.5 rounded-lg bg-surface-muted/60 border border-line flex items-center justify-between cursor-pointer hover:border-line-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-fg">
                        <Mail size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-fg">Notifications par Email</p>
                        <p className="text-[11px] text-fg-muted">Relevés officiels et accusés d&apos;enregistrement</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-line text-accent accent-accent pointer-events-none"
                    />
                  </div>

                  <div
                    onClick={() => handleNotificationToggle('sms')}
                    className="p-3.5 rounded-lg bg-surface-muted/60 border border-line flex items-center justify-between cursor-pointer hover:border-line-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-fg">
                        <Smartphone size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-fg">Alertes SMS instantanées</p>
                        <p className="text-[11px] text-fg-muted">Urgences de planning et fermeture d&apos;amphithéâtres</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-line text-accent accent-accent pointer-events-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-line/60 space-y-3">
                  <h3 className="text-xs font-semibold text-fg">Événements déclencheurs</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'requeteCreee' as const, label: 'Dépôt d’une requête', desc: 'Confirmation immédiate avec numéro de référence' },
                      { key: 'requeteTraitee' as const, label: 'Mise à jour de statut', desc: 'Passage en instruction, validation ou rejet de dossier' },
                      { key: 'nouveauMessage' as const, label: 'Message d’un agent', desc: 'Précisions demandées par la scolarité ou les enseignants' },
                      { key: 'rappels' as const, label: 'Rappels de cours & examens', desc: 'Rappels de créneau 1 heure avant la séance' },
                    ].map(({ key, label, desc }) => (
                      <div
                        key={key}
                        onClick={() => handleNotificationToggle(key)}
                        className="p-3 rounded-lg bg-surface/50 border border-line flex items-center justify-between cursor-pointer hover:border-line-hover transition-colors"
                      >
                        <div>
                          <p className="text-xs font-medium text-fg">{label}</p>
                          <p className="text-[11px] text-fg-muted">{desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[key]}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-line text-accent accent-accent pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            )}

            {/* ONGLET 3 : PRÉFÉRENCES & THÈME */}
            {activeTab === 'preferences' && (
              <GlassCard variant="glass" withShine={true} className="p-5 sm:p-6 space-y-6">
                <div className="pb-4 border-b border-line/60">
                  <h2 className="text-base font-bold text-fg">Affichage & Langue</h2>
                  <p className="text-xs text-fg-muted mt-0.5">
                    Personnalisez votre confort visuel sur l&apos;application.
                  </p>
                </div>

                {/* Thème clair / sombre */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-fg block">
                    Mode d&apos;apparence
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                        theme === 'light'
                          ? 'border-accent bg-accent/10 shadow-xs'
                          : 'border-line bg-surface-muted/60 hover:border-line-hover'
                      }`}
                    >
                      <Sun size={18} className={theme === 'light' ? 'text-accent' : 'text-fg-muted'} />
                      <div>
                        <p className="text-xs font-semibold text-fg">Mode Clair</p>
                        <p className="text-[11px] text-fg-muted">Contraste diurne optimal</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                        theme === 'dark'
                          ? 'border-accent bg-accent/10 shadow-xs'
                          : 'border-line bg-surface-muted/60 hover:border-line-hover'
                      }`}
                    >
                      <Moon size={18} className={theme === 'dark' ? 'text-accent' : 'text-fg-muted'} />
                      <div>
                        <p className="text-xs font-semibold text-fg">Mode Sombre</p>
                        <p className="text-[11px] text-fg-muted">Repose les yeux le soir</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Langue */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-fg block">
                    Langue du portail
                  </label>
                  <select
                    value={preferences.langue}
                    onChange={(e) => setPreferences({ langue: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-surface border border-line text-xs text-fg cursor-pointer"
                  >
                    <option value="fr">Français (Cameroun / International)</option>
                    <option value="en">English (Campus International)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSavePreferences}
                    isLoading={savingPrefs}
                    leftIcon={<Save size={14} />}
                  >
                    Enregistrer les préférences
                  </Button>
                </div>
              </GlassCard>
            )}

          </div>

        </div>

      </div>
    </StudentLayout>
  );
}
