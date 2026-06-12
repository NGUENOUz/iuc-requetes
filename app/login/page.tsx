'use client';

import React, { useState } from 'react';
import { AtSign, Lock, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ==========================================
// CONSTANTE LOGO : Modifiable facilement ici
// ==========================================
const COMPANY_LOGO = () => (
  <div className="flex items-center gap-3">
    {/* Icône temporaire stylisée en SVG / Lucide */}
    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-900/30">
      <ShieldCheck className="w-6 h-6 text-white" />
    </div>
    <div>
      <div className="text-xl font-black tracking-wider text-white lg:text-slate-900 dark:lg:text-white">
        IUC <span className="text-blue-500 font-medium">REQUÊTES</span>
      </div>
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold -mt-1">
        Plateforme Académique
      </p>
    </div>
  </div>
);

export default function LoginPage() {
  // Gestion des étapes : 
  // 1 = Saisie Matricule/Email
  // 2 = Première connexion (Définition mot de passe)
  // 3 = Connexion classique (Saisie du mot de passe existant)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Étape 1 : Vérification de l'identifiant (Simulation API Supabase)
  const handleCheckIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    
    // Simulation d'une attente réseau API
    setTimeout(() => {
      setIsLoading(false);
      
      // LOGIQUE TEMPORAIRE POUR TES TESTS :
      // Si l'identifiant contient "neuf" ou "new", on simule une PREMIÈRE CONNEXION (Étape 2)
      // Sinon, on considère que le compte est déjà actif (Étape 3)
      if (identifier.toLowerCase().includes('new') || identifier.toLowerCase().includes('iuc26')) {
        setStep(2);
        toast.success("🔑 Première connexion détectée ! Initialisez votre mot de passe.");
      } else {
        setStep(3);
        toast('Ravi de vous revoir ! Entrez votre mot de passe.', { icon: '👋' });
      }
    }, 1200);
  };

  // Étape 2 : Enregistrement du premier mot de passe
  const handleFirstTimeSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas !");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("🚀 Compte activé avec succès ! Redirection...");
      // Ici tu feras ta redirection vers le dashboard : router.push('/dashboard')
    }, 1500);
  };

  // Étape 3 : Connexion Standard
  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Connexion réussie !");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50">
      
      {/* ---------------------------------------------------- */}
      {/* CÔTÉ GAUCHE : PANNEAU VISUEL INSTITUTIONNEL          */}
      {/* ---------------------------------------------------- */}
      <div className="hidden lg:flex lg:w-1/2 bg-iuc-dark p-12 flex-col justify-between text-white relative overflow-hidden">
        
        {/* Rappel du Logo en haut à gauche */}
        <div className="z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-black tracking-wider text-blue-400">IUC REQUÊTES</div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Plateforme Officielle</p>
            </div>
          </div>
        </div>
        
        {/* Slogan centralisé au style percutant */}
        <div className="space-y-5 max-w-lg z-10">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            Suivez vos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 underline decoration-cyan-500/30">
              réclamations
            </span> <br />
            en temps réel.
          </h1>
          <p className="text-sm text-slate-300 font-medium max-w-md leading-relaxed">
            Entrez vos identifiants académiques fournis par l'établissement pour soumettre, consulter et suivre l'évolution de vos requêtes auprès de l'administration.
          </p>
        </div>

        {/* Footer du panneau gauche */}
        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest z-10">
          © 2026 Institut Universitaire de la Côte.
        </div>
        
        {/* Effets de halo lumineux d'arrière-plan (Modern Glassmorphism vibe) */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-15" />
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10" />
      </div>

      {/* ---------------------------------------------------- */}
      {/* CÔTÉ DROIT : FORMULAIRE DYNAMIQUE                   */}
      {/* ---------------------------------------------------- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12">
        
        {/* Affichage du logo uniquement sur mobile/tablette en haut */}
        <div className="lg:hidden flex justify-start pt-2">
          {COMPANY_LOGO()}
        </div>

        <div className="w-full max-w-md mx-auto my-auto space-y-8 bg-white p-8 sm:p-10 rounded-iuc shadow-xl shadow-slate-200/50 border border-slate-100">
          
          {/* En-tête dynamique des formulaires */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {step === 1 && "Connexion à votre espace"}
              {step === 2 && "Créer votre mot de passe"}
              {step === 3 && "Saisissez votre mot de passe"}
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-snug">
              {step === 1 && "Entrez votre e-mail étudiant ou votre matricule IUC pour commencer."}
              {step === 2 && "Sécurisez vos accès universitaires en choisissant un mot de passe robuste."}
              {step === 3 && "Veuillez renseigner votre clé d'accès pour ouvrir votre session."}
            </p>
          </div>

          {/* ================================================== */}
          {/* ÉTAPE 1 : IDENTIFICATION (MATRICULE OU EMAIL)      */}
          {/* ================================================== */}
          {step === 1 && (
            <form onSubmit={handleCheckIdentifier} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-700 block">
                  Identifiant Unique
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <AtSign className="w-5 h-5" />
                  </span>
                  <input 
                    type="text" 
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ex: iuc26xxxx ou nom@myiuc.com" 
                    className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm shadow-inner"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-slate-900 hover:bg-blue-950 text-white rounded-xl font-black italic uppercase text-xs tracking-wider transition-all shadow-md shadow-slate-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Vérification en cours..." : (
                  <>
                    Continuer <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================================================== */}
          {/* ÉTAPE 2 : CONFIGURATION PREMIÈRE CONNEXION         */}
          {/* ================================================== */}
          {step === 2 && (
            <form onSubmit={handleFirstTimeSetup} className="space-y-5">
              {/* Badge d'avertissement de première connexion */}
              <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0" />
                <p className="text-[11px] font-bold text-cyan-800 uppercase tracking-wide leading-tight">
                  Nouveau compte détecté ! Initialisez vos accès.
                </p>
              </div>

              {/* Rappel en lecture seule de l'identifiant saisi */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identifiant sélectionné</label>
                <input type="text" disabled value={identifier} className="w-full h-10 px-4 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-500 text-xs cursor-not-allowed" />
              </div>

              {/* Nouveau Mot de passe */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-700 block">Nouveau mot de passe</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm" 
                  />
                </div>
              </div>

              {/* Confirmation */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-700 block">Confirmer le mot de passe</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input 
                    type="password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm" 
                  />
                </div>
              </div>

              {/* Boutons d'actions groupés */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="h-14 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-grow h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black italic uppercase text-xs tracking-wider transition-all shadow-md shadow-blue-100"
                >
                  {isLoading ? "Configuration..." : "Activer et accéder"}
                </button>
              </div>
            </form>
          )}

          {/* ================================================== */}
          {/* ÉTAPE 3 : FORMULAIRE DE CONNEXION TRADITIONNEL     */}
          {/* ================================================== */}
          {step === 3 && (
            <form onSubmit={handleStandardLogin} className="space-y-6">
              {/* Rappel identifiant */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identifiant</label>
                <input type="text" disabled value={identifier} className="w-full h-10 px-4 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-500 text-xs cursor-not-allowed" />
              </div>

              {/* Saisie mot de passe */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-700">Mot de passe</label>
                  <a href="#" className="text-xs font-bold text-blue-600 hover:underline">Oublié ?</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full h-14 pl-12 pr-5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm" 
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="h-14 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-grow h-14 bg-slate-900 hover:bg-blue-950 text-white rounded-xl font-black italic uppercase text-xs tracking-wider transition-all shadow-md shadow-slate-300"
                >
                  {isLoading ? "Authentification..." : "Se connecter"}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Petit disclaimer ou lien utile en bas du formulaire */}
        <div className="text-center text-xs font-medium text-slate-400 mt-4">
          Besoin d'assistance ? Contactez le service informatique de l'IUC.
        </div>
      </div>
    </div>
  );
}