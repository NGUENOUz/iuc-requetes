'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Shield, Bell, Eye, EyeOff, Lock, Mail,
  Smartphone, CheckCircle, Home, Settings, LogOut, Trash2,
  AlertCircle, Save
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';

function ParametresContent() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
    theme: 'light',
  });

  const [saving, setSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [preferencesSuccess, setPreferencesSuccess] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    setPasswordSuccess(true);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const savePreferences = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setPreferencesSuccess(true);
    setTimeout(() => setPreferencesSuccess(false), 3000);
  };

  return (
    <div className="p-3 sm:p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
          <Home size={14} />
          Tableau de bord
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Paramètres</span>
      </div>

      {/* Bouton retour */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600 font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        Retour au tableau de bord
      </Link>

      {/* En-tête */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Paramètres</h1>
            <p className="text-slate-200 text-sm">Gérez votre compte et vos préférences</p>
          </div>
        </div>
      </div>

      {/* Messages de succès */}
      {passwordSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-900">
            Votre mot de passe a été modifié avec succès !
          </p>
        </div>
      )}

      {preferencesSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-600" />
          <p className="text-sm font-semibold text-emerald-900">
            Vos préférences ont été enregistrées !
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Menu latéral */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-2xl border shadow-sm p-3">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm">
              <Shield size={18} />
              Sécurité
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors">
              <Bell size={18} />
              Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors">
              <Settings size={18} />
              Préférences
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900 text-sm mb-1">Zone dangereuse</p>
                <p className="text-xs text-red-700 mb-3">
                  Ces actions sont irréversibles. Procédez avec prudence.
                </p>
                <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                  <Trash2 size={14} />
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Sécurité et mot de passe */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-slate-700" />
              <h2 className="font-bold text-slate-900">Sécurité et mot de passe</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Mot de passe actuel */}
              <div>
                <label htmlFor="current" className="block text-sm font-semibold text-slate-700 mb-2">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="current"
                    name="current"
                    value={passwordForm.current}
                    onChange={handlePasswordChange}
                    className="w-full h-11 bg-slate-50 rounded-xl pl-10 pr-12 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label htmlFor="new" className="block text-sm font-semibold text-slate-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="new"
                    name="new"
                    value={passwordForm.new}
                    onChange={handlePasswordChange}
                    className="w-full h-11 bg-slate-50 rounded-xl pl-10 pr-12 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label htmlFor="confirm" className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm"
                    name="confirm"
                    value={passwordForm.confirm}
                    onChange={handlePasswordChange}
                    className="w-full h-11 bg-slate-50 rounded-xl pl-10 pr-12 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || !passwordForm.current || !passwordForm.new || !passwordForm.confirm}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Modification en cours...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Changer le mot de passe
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-slate-700" />
              <h2 className="font-bold text-slate-900">Préférences de notification</h2>
            </div>

            <div className="space-y-4">
              {/* Canaux */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Canaux de notification</p>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">Email</p>
                        <p className="text-xs text-slate-500">Recevoir des notifications par email</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={() => handleNotificationToggle('email')}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-400"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Smartphone size={18} className="text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">SMS</p>
                        <p className="text-xs text-slate-500">Recevoir des notifications par SMS</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={() => handleNotificationToggle('sms')}
                      className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-400"
                    />
                  </label>
                </div>
              </div>

              {/* Types de notifications */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Types de notifications</p>
                <div className="space-y-2">
                  {[
                    { key: 'requeteCreee', label: 'Requête créée', desc: 'Confirmation de création de requête' },
                    { key: 'requeteTraitee', label: 'Requête traitée', desc: 'Quand une requête est résolue' },
                    { key: 'nouveauMessage', label: 'Nouveau message', desc: 'Quand vous recevez une réponse' },
                    { key: 'rappels', label: 'Rappels', desc: 'Rappels pour actions en attente' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[key as keyof typeof notifications] as boolean}
                        onChange={() => handleNotificationToggle(key)}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-400"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Préférences */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings size={20} className="text-slate-700" />
              <h2 className="font-bold text-slate-900">Préférences générales</h2>
            </div>

            <div className="space-y-4">
              {/* Langue */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Langue</label>
                <select
                  value={preferences.langue}
                  onChange={(e) => handlePreferenceChange('langue', e.target.value)}
                  className="w-full h-11 bg-slate-50 rounded-xl px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              {/* Thème */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Thème</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePreferenceChange('theme', 'light')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      preferences.theme === 'light'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-sm">Clair</p>
                    <p className="text-xs text-slate-500">Thème par défaut</p>
                  </button>
                  <button
                    onClick={() => handlePreferenceChange('theme', 'dark')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      preferences.theme === 'dark'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-sm">Sombre</p>
                    <p className="text-xs text-slate-500">Pour les yeux sensibles</p>
                  </button>
                </div>
              </div>

              <button
                onClick={savePreferences}
                disabled={saving}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Enregistrer les préférences
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Déconnexion */}
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                <LogOut size={20} className="text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">Se déconnecter</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Déconnectez-vous de votre compte sur cet appareil
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParametresPage() {
  return (
    <StudentLayout>
      <ParametresContent />
    </StudentLayout>
  );
}
