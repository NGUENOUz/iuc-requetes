'use client';

import React, { useState } from 'react';
import { GraduationCap, User, Lock, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  // 1 = Saisie Identifiant, 2 = Première connexion (Définir MDP), 3 = Connexion classique
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Étape 1 : Vérification Matricule / Email
  const handleCheckIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Simulation : Si l'identifiant contient "iuc" ou "new", c'est une première connexion
      if (identifier.toLowerCase().includes('new') || identifier.toLowerCase().includes('iuc')) {
        setStep(2);
        toast.success("✨ Première connexion détectée ! Initialisez votre compte.");
      } else {
        setStep(3);
      }
    }, 1000);
  };

  // Étape 2 : Première connexion - Création du mot de passe
  const handleFirstTimeSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas !");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("🚀 Mot de passe enregistré ! Redirection...");
    }, 1200);
  };

  // Étape 3 : Connexion classique
  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Connexion réussie !");
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      
      {/* Boîtier principal avec largeur max optimisée pour éviter l'effet trop large */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[580px]">
        
        {/* ========================================== */}
        {/* PARTIE GAUCHE : VISUEL (Caché sur mobile)  */}
        {/* ========================================== */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-green-500 to-emerald-400 p-8 md:p-12 hidden lg:flex lg:col-span-5 flex-col justify-between text-white overflow-hidden">
          
          <div className="z-10">
            <GraduationCap size={64} strokeWidth={1.5} className="drop-shadow-md" />
          </div>

          <div className="space-y-6 z-10 my-auto">
            <h1 className="text-3xl xl:text-4xl font-black uppercase tracking-tight leading-none">
              Gestion des
              <br />
              <span className="text-emerald-100">Requêtes</span>
              <br />
              Étudiant
            </h1>
            <div className="w-16 h-[3px] bg-white rounded-full"></div>
            <p className="text-sm xl:text-base leading-relaxed opacity-90 font-medium">
              Simplifiez vos démarches académiques et suivez l'avancement de vos réclamations en temps réel.
            </p>
          </div>

          <div className="text-[10px] uppercase tracking-widest font-bold opacity-60 z-10">
            © 2026 Espace Universitaire
          </div>

          {/* Illustration décorative discrète en filigrane */}
          <div className="absolute -bottom-10 -left-10 opacity-10 pointer-events-none transform -rotate-12">
            <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
              <path d="M9 12h6" /><path d="M9 16h6" /><path d="M9 8h6" />
              <path d="M5 3h14a2 2 0 0 1 2 2v14" /><path d="M19 21H5a2 2 0 0 1-2-2V5" />
            </svg>
          </div>
        </div>

        {/* ========================================== */}
        {/* PARTIE DROITE : FORMULAIRE DYNAMIQUE       */}
        {/* ========================================== */}
        <div className="bg-white flex items-center justify-center px-6 py-10 sm:p-12 md:p-16 lg:col-span-7">
          <div className="w-full max-w-md mx-auto space-y-6 md:space-y-8">

            {/* En-tête avec Avatar circulaire */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100 shadow-sm">
                <User size={40} className="text-emerald-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight text-center">
                {step === 1 && "Connexion"}
                {step === 2 && "Première Connexion"}
                {step === 3 && "Vérification"}
              </h2>
              <p className="text-center text-gray-500 text-xs md:text-sm mt-1 px-4 font-medium">
                {step === 1 && "Veuillez entrer votre identifiant pour accéder à votre espace."}
                {step === 2 && "Créez votre mot de passe pour activer votre espace étudiant."}
                {step === 3 && "Entrez votre mot de passe pour ouvrir la session."}
              </p>
            </div>

            {/* ========================================== */}
            {/* ÉTAPE 1 : ENTRÉE DE L'IDENTIFIANT          */}
            {/* ========================================== */}
            {step === 1 && (
              <form onSubmit={handleCheckIdentifier} className="space-y-5">
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Matricule ou mail étudiant"
                    className="w-full h-14 rounded-xl border border-gray-200 pl-12 pr-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-600/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? "Vérification..." : (
                    <>
                      Continuer <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ========================================== */}
            {/* ÉTAPE 2 : INITIALISATION PREMIÈRE FOIS    */}
            {/* ========================================== */}
            {step === 2 && (
              <form onSubmit={handleFirstTimeSetup} className="space-y-4">
                <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl text-center">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    ✨ Nouveau compte trouvé ! Configurez vos accès.
                  </p>
                </div>

                {/* Rappel identifiant masqué */}
                <input type="text" disabled value={identifier} className="w-full h-10 px-4 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed" />

                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Créer un mot de passe"
                    className="w-full h-14 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="w-full h-14 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-14 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-grow h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-70"
                  >
                    {isLoading ? "Enregistrement..." : "ACTIVER MON COMPTE"}
                  </button>
                </div>
              </form>
            )}

            {/* ========================================== */}
            {/* ÉTAPE 3 : CONNEXION CLASSIQUE (MOT DE PASSE)*/}
            {/* ========================================== */}
            {step === 3 && (
              <form onSubmit={handleStandardLogin} className="space-y-4">
                <input type="text" disabled value={identifier} className="w-full h-10 px-4 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed" />

                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    className="w-full h-14 rounded-xl border border-gray-200 pl-11 pr-4 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-14 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-grow h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-70"
                  >
                    {isLoading ? "Connexion..." : "SE CONNECTER"}
                  </button>
                </div>
              </form>
            )}

            {/* Séparateur bas */}
            <div className="flex items-center gap-4 pt-4">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">IUC</span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}