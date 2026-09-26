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

  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2 min-h-[540px]">
        
        {/* Left Side: Monochromatic Visual Architecture */}
        <div className="bg-[#09090b] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden border-r border-zinc-800">
          
          {/* Subtle Grid Accent */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-black font-black text-base flex items-center justify-center tracking-tighter shadow-sm">
                IUC
              </div>
              <div>
                <p className="font-extrabold text-sm tracking-tight text-white leading-none">
                  INSTITUT UNIVERSITAIRE DE LA CÔTE
                </p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mt-1">
                  Portail Numérique Centralisé
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 relative z-10 my-auto py-8">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Guichet Unique Numérique
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3 leading-tight">
                Gestion automatisée des requêtes universitaires
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Plateforme institutionnelle dédiée aux étudiants, enseignants et personnels de l'IUC pour le traitement priorisé et la délivrance numérique immédiate de documents.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="text-white shrink-0" />
                <span>Délivrance instantanée d'attestations certifiées</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={15} className="text-white shrink-0" />
                <span>Authenticité garantie par signature et QR Code</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap size={15} className="text-white shrink-0" />
                <span>Aiguillage automatique sans goulot d'étranglement</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
            <span>Sécurisé TLS 256-bit</span>
            <span>IUC v2.5</span>
          </div>

        </div>

        {/* Right Side: Clean Black & White Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-sm mx-auto space-y-6">
            
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950">
                Authentification
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {stage === 'identify'
                  ? 'Saisissez votre matricule ou adresse email institutionnelle'
                  : 'Saisissez votre mot de passe pour accéder à votre espace'}
              </p>
            </div>

            {stage === 'identify' ? (
              <form onSubmit={handleIdentify} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="identifier" className="block text-xs font-mono uppercase text-zinc-500 font-bold">
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
                      placeholder="Ex: 22IUC01452 ou prof.ewane@iuc.cm"
                      className="w-full h-11 pl-9 pr-3 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !identifier.trim()}
                  className="w-full h-11 bg-black hover:bg-zinc-800 disabled:bg-zinc-200 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  {isLoading ? 'Vérification...' : 'Continuer'}
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-600 truncate">{identifier}</span>
                  <button
                    type="button"
                    onClick={() => setStage('identify')}
                    className="text-black font-bold text-[11px] hover:underline shrink-0 ml-2"
                  >
                    Modifier
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-mono uppercase text-zinc-500 font-bold">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-9 pr-3 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full h-11 bg-black hover:bg-zinc-800 disabled:bg-zinc-200 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  {isLoading ? 'Connexion en cours...' : 'Ouvrir mon espace'}
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-zinc-100 text-center">
              <p className="text-[11px] font-mono text-zinc-400">
                Campus Logbessou & Akwa • Douala, Cameroun
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Modal pour nouveau mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-xl p-6 sm:p-8 w-full max-w-md space-y-4">
            <div>
              <h3 className="text-base font-bold text-zinc-950">Définir votre mot de passe</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Première connexion détectée pour ce compte. Veuillez choisir un mot de passe sécurisé.
              </p>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-500 font-bold mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-500 font-bold mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className="w-full h-10 px-3 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 h-10 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-10 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-lg transition-colors"
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