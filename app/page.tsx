'use client';

import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, Calendar, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [stage, setStage] = useState<'identify' | 'login'>('identify');

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Identifiant introuvable');
        setIsLoading(false);
        return;
      }
      if (data.mustSetPassword) {
        setShowPasswordModal(true);
        toast.info('Première connexion : veuillez définir votre mot de passe.');
      } else {
        setStage('login');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Identifiants incorrects');
        setIsLoading(false);
        return;
      }

      if (data.data?.session) {
        const { session } = data.data;
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        localStorage.setItem('campuslite_user', JSON.stringify(data.data.user));
        localStorage.setItem('iuc_user', JSON.stringify(data.data.user));
      }

      toast.success('Connexion établie');

      const role = data.data?.user?.role?.name || data.data?.user?.role_code;

      if (
        role?.toLowerCase() === 'admin' ||
        role?.toLowerCase() === 'agent' ||
        role?.toLowerCase() === 'chef_service'
      ) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Le mot de passe doit comporter au moins 8 caractères');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Échec de la mise à jour du mot de passe');
      } else {
        toast.success('Mot de passe configuré avec succès');
        setShowPasswordModal(false);
        setStage('login');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (id: string, pwd: string = 'password123') => {
    setIdentifier(id);
    setPassword(pwd);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Identifiants incorrects');
        setIsLoading(false);
        return;
      }
      if (data.data?.session) {
        const { session } = data.data;
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        localStorage.setItem('campuslite_user', JSON.stringify(data.data.user));
        localStorage.setItem('iuc_user', JSON.stringify(data.data.user));
      }
      toast.success('Connexion établie');
      const role = data.data?.user?.role?.name || data.data?.user?.role_code;
      if (
        role?.toLowerCase() === 'admin' ||
        role?.toLowerCase() === 'agent' ||
        role?.toLowerCase() === 'chef_service'
      ) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-fg flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden transition-colors">
      
      {/* Halo d'ambiance subtil en dérive lente pour la page de connexion */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none opacity-20 dark:opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-4xl glass-raised rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 relative z-10 border border-line">
        
        {/* Volet Gauche : Présentation Institutionnelle */}
        <div className="p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-line bg-surface-muted/40 relative">
          
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent text-accent-fg font-black text-sm flex items-center justify-center tracking-tight shadow-sm">
                CL
              </div>
              <div>
                <p className="font-extrabold text-base tracking-tight text-fg leading-none font-title">
                  CampusLite
                </p>
                <p className="text-xs text-fg-muted mt-1 font-medium">
                  Portail Universitaire Unifié
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <StatusBadge variant="info" className="text-xs">
                Système d&apos;Information Académique
              </StatusBadge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg leading-tight font-title">
                Espace Numérique Étudiant & Enseignant
              </h1>
              <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed">
                Consultez vos relevés semestriels, localisez vos salles de cours avec le guidage campus 3D et suivez l&apos;instruction de vos requêtes en toute sérénité.
              </p>
            </div>
          </div>

          <div className="space-y-3 py-6 text-xs text-fg-secondary">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <ShieldCheck size={14} />
              </div>
              <span>Relevés de notes officiels CC & examens terminaux</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Calendar size={14} />
              </div>
              <span>Planning interactif & localisation GPS des salles</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Sparkles size={14} />
              </div>
              <span>Délivrance et vérification instantanée d&apos;attestations</span>
            </div>
          </div>

          <div className="pt-4 border-t border-line/60 text-[11px] font-mono text-fg-muted flex items-center justify-between">
            <span>Certifié TLS 256-bit</span>
            <span>Édition 2025-2026</span>
          </div>

        </div>

        {/* Volet Droit : Formulaire d'authentification */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-surface/70">
          <div className="w-full max-w-sm mx-auto space-y-6">
            
            <div>
              <h2 className="text-xl font-bold tracking-tight text-fg font-title">
                Accéder au portail
              </h2>
              <p className="text-xs text-fg-muted mt-1">
                {stage === 'identify'
                  ? 'Saisissez votre matricule étudiant ou email institutionnel'
                  : 'Saisissez votre mot de passe pour ouvrir votre session'}
              </p>
            </div>

            {stage === 'identify' ? (
              <form onSubmit={handleIdentify} className="space-y-4">
                <Input
                  label="Identifiant / Matricule / Email"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex : 22UNI01452 ou etudiant@iuc.cm"
                  leftIcon={<User size={15} />}
                  helperText="Format matricule ou adresse @iuc.cm"
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={14} />}
                >
                  Continuer
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="p-3 rounded-lg bg-surface-muted/80 border border-line flex items-center justify-between text-xs">
                  <span className="font-mono text-fg truncate">{identifier}</span>
                  <button
                    type="button"
                    onClick={() => setStage('identify')}
                    className="text-accent hover:underline font-semibold text-xs ml-2 cursor-pointer"
                  >
                    Modifier
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    leftIcon={<Lock size={15} />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-fg-muted hover:text-fg transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={14} />}
                >
                  Ouvrir mon espace
                </Button>
              </form>
            )}

            {/* Accès Démo Rapide (1 Clic) */}
            <div className="pt-4 border-t border-line/60 space-y-2">
              <span className="text-[11px] text-fg-muted block text-center font-medium">
                Comptes de démonstration :
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin('etudiant@iuc.cm')}
                  disabled={isLoading}
                  className="p-2.5 rounded-lg bg-surface-muted/60 border border-line hover:border-line-hover text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-semibold text-fg truncate">
                    Étudiant (Kevin)
                  </p>
                  <p className="text-[10px] text-fg-muted font-mono truncate">L3 Informatique</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickLogin('prof.ewane@iuc.cm')}
                  disabled={isLoading}
                  className="p-2.5 rounded-lg bg-surface-muted/60 border border-line hover:border-line-hover text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-semibold text-fg truncate">
                    Enseignant (Dr. Ewane)
                  </p>
                  <p className="text-[10px] text-fg-muted font-mono truncate">Planner & Salles</p>
                </button>
              </div>

              <button
                type="button"
                onClick={() => quickLogin('admin@iuc.cm')}
                disabled={isLoading}
                className="w-full p-2 rounded-lg bg-surface-muted/40 border border-line/60 hover:border-line text-center text-xs text-fg-secondary hover:text-fg transition-colors cursor-pointer font-medium"
              >
                Accéder à l&apos;Administration / Scolarité
              </button>
            </div>

            <div className="pt-1 text-center">
              <p className="text-[11px] text-fg-muted">
                CampusLite • Institut Universitaire de la Côte
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Modal Définition Mot de passe Première Connexion */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Création de votre mot de passe"
        description="Première connexion détectée pour ce compte. Veuillez choisir un mot de passe sécurisé."
        maxWidth="sm"
      >
        <form onSubmit={handleSetPassword} className="space-y-4 pt-2">
          <Input
            label="Nouveau mot de passe"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 caractères"
            helperText="8 caractères minimum conseillés"
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Répétez le mot de passe"
          />

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setShowPasswordModal(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Valider le mot de passe
            </Button>
          </div>
        </form>
      </Modal>

    </main>
  );
}