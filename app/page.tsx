'use client';

import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, Zap, CheckCircle2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        toast.success('Première connexion : veuillez définir votre mot de passe.');
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
      
      if (role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'agent' || role?.toLowerCase() === 'chef_service') {
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
      if (role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'agent' || role?.toLowerCase() === 'chef_service') {
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
    <main className="min-h-screen bg-slate-50/80 dark:bg-[#09090b] text-zinc-900 dark:text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden transition-colors duration-200">
      {/* Ambient Sunset Orange Orbs */}
      <div className="ambient-glow-orange top-0 left-1/3 -translate-x-1/2 opacity-35 dark:opacity-60 pointer-events-none" />
      <div className="ambient-glow-amber bottom-10 right-10 opacity-25 dark:opacity-40 pointer-events-none" />

      <div className="w-full max-w-4xl glass-panel rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 min-h-[580px] relative z-10 border border-zinc-200/80 dark:border-white/10">
        
        {/* Top vibrant sunset gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 z-20" />

        {/* Left Side: Monochromatic Visual Architecture */}
        <div className="p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-200/80 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950/40">
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-sm flex items-center justify-center tracking-tight shadow-md shadow-orange-500/20">
                CL
              </div>
              <div>
                <p className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white leading-none">
                  CampusLite
                </p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-orange-600 dark:text-orange-400 mt-1 font-semibold">
                  Portail Universitaire Unifié
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 relative z-10 my-auto py-8">
            <div>
              <span className="glass-badge glass-badge-orange px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">
                Cycle de Vie & Démarches
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-3 leading-tight">
                Hub Numérique de l&apos;Étudiant & du Corps Enseignant
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Consultez vos relevés de notes (CC & SN), découvrez l&apos;attribution de vos salles de cours en temps réel et déposez vos requêtes académiques en toute transparence.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Relevé de notes CC & SN par cycle et semestre</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={15} className="text-orange-500 dark:text-orange-400 shrink-0" />
                <span>Planner & calendrier d&apos;attribution des salles</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap size={15} className="text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Délivrance express d&apos;attestations certifiées QR</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-zinc-200/70 dark:border-white/10 text-[11px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
            <span>Sécurisé TLS 256-bit</span>
            <span>CampusLite v3.0 Global</span>
          </div>

        </div>

        {/* Right Side: Glassmorphic Auth Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white/40 dark:bg-zinc-900/30 backdrop-blur-xl">
          <div className="w-full max-w-sm mx-auto space-y-6">
            
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Authentification
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {stage === 'identify'
                  ? 'Saisissez votre matricule ou adresse email institutionnelle'
                  : 'Saisissez votre mot de passe pour accéder à votre espace'}
              </p>
            </div>

            {stage === 'identify' ? (
              <form onSubmit={handleIdentify} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="identifier" className="block text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">
                    Identifiant / Matricule / Email
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Ex: 22UNI01452 ou prof.ewane@campuslite.edu"
                      className="w-full h-11 pl-9 pr-3 glass-input rounded-xl text-xs placeholder:text-zinc-400 font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !identifier.trim()}
                  className="w-full h-11 btn-orange font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-40"
                >
                  {isLoading ? 'Vérification...' : 'Continuer'}
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="p-3 glass-card rounded-xl flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-800 dark:text-zinc-200 truncate">{identifier}</span>
                  <button
                    type="button"
                    onClick={() => setStage('identify')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px] hover:underline shrink-0 ml-2 cursor-pointer"
                  >
                    Modifier
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                      id="password"
                      type="password"
                      required
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-9 pr-3 glass-input rounded-xl text-xs placeholder:text-zinc-400 font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full h-11 btn-orange font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-40"
                >
                  {isLoading ? 'Connexion en cours...' : 'Ouvrir mon espace'}
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            {/* Quick Demo Logins Section */}
            <div className="pt-4 border-t border-zinc-200/70 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block text-center">
                Connexion rapide démo (1 clic) :
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin('etudiant@iuc.cm')}
                  disabled={isLoading}
                  className="glass-card hover:border-orange-500/50 p-2.5 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 truncate">
                    Étudiant (Kevin)
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">L3 Informatique</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickLogin('prof.ewane@iuc.cm')}
                  disabled={isLoading}
                  className="glass-card hover:border-amber-500/50 p-2.5 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <p className="text-[11px] font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                    Enseignant (Dr. Ewane)
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">Planner & Salles</p>
                </button>
              </div>

              <button
                type="button"
                onClick={() => quickLogin('admin@iuc.cm')}
                disabled={isLoading}
                className="w-full glass-card hover:border-orange-400/30 p-2 rounded-xl text-center text-[10px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors cursor-pointer"
              >
                Accès Scolarité & Administration
              </button>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                CampusLite • Plateforme Universitaire Ouverte
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Modal pour nouveau mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 w-full max-w-md space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Définir votre mot de passe</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Première connexion détectée pour ce compte. Veuillez choisir un mot de passe sécurisé.
              </p>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 font-bold mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full h-10 px-3 glass-input rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 font-bold mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className="w-full h-10 px-3 glass-input rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 h-10 glass-card text-zinc-300 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-10 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl transition-colors"
                >
                  {isLoading ? 'Enregistrement...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}