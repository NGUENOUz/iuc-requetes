'use client';

import React, { useState } from 'react';
import { GraduationCap, User, Lock, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); // email or matricule
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // UI step management
  const [stage, setStage] = useState<'identify' | 'login'>('identify');

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Identifiant introuvable");
        setIsLoading(false);
        return;
      }
      if (data.mustSetPassword) {
        setShowPasswordModal(true);
        toast.success('Première connexion : veuillez définir un nouveau mot de passe.');
      } else {
        // Proceed to password entry for existing accounts
        setStage('login');
        toast.success('Identifiant reconnu, veuillez entrer votre mot de passe.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur serveur lors de la vérification');
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Échec de la connexion');
        setIsLoading(false);
        return;
      }
      // Successful login, redirect based on role
      const role = data.user?.role?.name;
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'etudiant') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
      toast.success('Connexion réussie');
    } catch (err) {
      console.error(err);
      toast.error('Erreur serveur lors de la connexion');
    }
    setIsLoading(false);
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
        body: JSON.stringify({ identifier, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Échec de la mise à jour du mot de passe');
      } else {
        toast.success('Mot de passe mis à jour, vous pouvez vous reconnecter');
        setShowPasswordModal(false);
        setIdentifier('');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur serveur');
    }
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl bg-white/45 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-xl shadow-slate-200/20 border border-white/45 grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
        {/* Visual side */}
        <div className="relative bg-gradient-to-br from-[#064e3b]/95 via-[#032f25]/95 to-[#0f172a]/95 p-12 hidden lg:flex flex-col justify-between text-white overflow-hidden">
          <div className="z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/10">
              <img src="https://res.cloudinary.com/dcsl6xhli/image/upload/v1781788982/images-removebg-preview_epbah4.png" alt="IUC logo" className="h-12 w-12 object-contain" />
            </div>
          </div>
          <div className="space-y-5 z-10 my-auto">
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight text-emerald-50">
              Gestion des<br />Requêtes Étudiants
            </h1>
            <div className="w-10 h-0.5 bg-emerald-400/40 rounded-full"></div>
            <p className="text-sm leading-relaxed text-slate-300/90 font-medium">
              Simplifiez vos démarches académiques et suivez vos réclamations en temps réel sur une interface repensée.
            </p>
          </div>
          <div className="text-[10px] tracking-wider text-slate-400/75 z-10 font-medium">
            © 2025 IUC - Espace Universitaire
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none transform rotate-12">
            <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.5">
              <path d="M9 12h6" />
              <path d="M9 16h6" />
              <path d="M9 8h6" />
              <path d="M5 3h14a2 2 0 0 1 2 2v14" />
              <path d="M19 21H5a2 2 0 0 1-2-2V5" />
            </svg>
          </div>
        </div>
        {/* Form side */}
        <div className="bg-white/30 backdrop-blur-md flex items-center justify-center px-8 sm:px-12 py-12">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50/60 flex items-center justify-center mx-auto border border-emerald-100/50 shadow-sm shadow-emerald-500/5">
                <img src="https://res.cloudinary.com/dcsl6xhli/image/upload/v1781788982/images-removebg-preview_epbah4.png" alt="IUC logo" className="h-8 w-8 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Connexion</h2>
              <p className="text-slate-500 text-xs font-medium">Entrez votre matricule ou email</p>
            </div>
              {stage === 'identify' ? (
                <form onSubmit={handleIdentify} className="space-y-4">
                  <Input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Matricule ou email"
                    leftIcon={<User size={16} className="text-slate-400" />}
                  />
                  <Button type="submit" isLoading={isLoading} className="w-full shadow-sm" size="lg" rightIcon={<ArrowRight size={16} />}>Suivant</Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    leftIcon={<Lock size={16} className="text-slate-400" />}
                  />
                  <Button type="submit" isLoading={isLoading} className="w-full shadow-sm" size="lg" rightIcon={<ArrowRight size={16} />}>Connexion</Button>
                </form>
              )}
            <div className="pt-4 text-center">
              <p className="text-[11px] text-slate-400/90 font-medium">© 2025 IUC - Tous droits réservés</p>
            </div>
          </div>
        </div>
      </div>

      {/* First‑login password modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Définir votre mot de passe</h3>
            <form onSubmit={handleSetPassword} className="space-y-4">
              <Input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                leftIcon={<Lock size={16} className="text-slate-400" />}
              />
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                leftIcon={<Lock size={16} className="text-slate-400" />}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1"
                  size="lg"
                >Annuler</Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="flex-1"
                  size="lg"
                >Enregistrer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}