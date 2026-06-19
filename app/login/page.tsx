'use client';

import React, { useState } from 'react';
import { AtSign, Lock, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // CORRECTION : Redirection dynamique basée sur le rôle
  const handleRedirect = (roleName: string) => {
    console.log('[Frontend] handleRedirect called with roleName:', roleName);
    console.log('[Frontend] roleName type:', typeof roleName);
    
    const role = roleName?.toLowerCase().trim();
    console.log('[Frontend] role after processing:', role);
    
    // Si c'est un admin, on va vers /admin
    if (role === 'admin' || role === 'administrateur') {
      console.log('[Frontend] Redirecting to /admin');
      router.push('/admin');
    } 
    // Sinon (étudiant, etc.), on va vers /dashboard
    else {
      console.log('[Frontend] Redirecting to /dashboard');
      router.push('/dashboard');
    }
  };

  const handleCheckIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/check-user', {
        method: 'POST',
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(data.mustSetPassword ? 2 : 3);
      } else {
        toast.error("Utilisateur non trouvé.");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (res.ok) {
        console.log('Login response data:', data);
        console.log('User role:', data.data?.user?.role);
        console.log('Role name:', data.data?.user?.role?.name);
        
        toast.success("Connexion réussie !");
        // L'API retourne { success: true, data: { user, session } }
        handleRedirect(data.data.user.role.name);
      } else {
        toast.error(data.message || "Erreur de connexion");
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error("Erreur serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50">
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12">
        {step === 1 && (
          <form onSubmit={handleCheckIdentifier} className="space-y-6">
            <div className="relative">
              <AtSign className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="text" 
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Votre identifiant..."
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full h-14 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              {isLoading ? "Vérification..." : (
                <>
                  Continuer <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
              toast.error("Les mots de passe ne correspondent pas");
              return;
            }
            setIsLoading(true);
            try {
              const res = await fetch('/api/auth/set-password', {
                method: 'POST',
                body: JSON.stringify({ identifier, password }),
              });
              const data = await res.json();
              console.log('Set password response:', data);
              console.log('User role:', data.data?.user?.role);
              
              if (res.ok) {
                toast.success("Mot de passe défini avec succès !");
                // L'API retourne { success: true, data: { user, session } }
                handleRedirect(data.data.user.role.name);
              } else {
                toast.error(data.message || "Erreur");
              }
            } catch (err) {
              toast.error("Erreur serveur");
            } finally {
              setIsLoading(false);
            }
          }} className="space-y-6">
            <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft size={20} /> Retour
            </button>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Définir un mot de passe"
              />
            </div>
            <div className="relative">
              <CheckCircle2 className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Confirmer le mot de passe"
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full h-14 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
              {isLoading ? "Enregistrement..." : "Définir le mot de passe"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStandardLogin} className="space-y-6">
            <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft size={20} /> Retour
            </button>
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Votre mot de passe"
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full h-14 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}