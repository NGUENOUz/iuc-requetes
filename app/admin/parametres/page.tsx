'use client';

import { useState } from 'react';
import { Settings, Save, Bell, Mail, Clock, Shield, Database, Zap, Users, FileText, Palette, Globe, Check } from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  settings: Setting[];
}

interface Setting {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'number' | 'text';
  value: any;
  options?: { value: string; label: string }[];
}

export default function ParametresPage() {
  const [sections, setSections] = useState<SettingSection[]>([
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          id: 'email-notifs',
          label: 'Notifications par e-mail',
          description: 'Recevoir des e-mails pour les nouvelles requêtes et mises à jour',
          type: 'toggle',
          value: true
        },
        {
          id: 'sms-notifs',
          label: 'Notifications SMS',
          description: 'Alertes SMS pour les requêtes critiques uniquement',
          type: 'toggle',
          value: false
        },
        {
          id: 'notif-freq',
          label: 'Fréquence des notifications',
          description: 'Définir la fréquence des résumés par e-mail',
          type: 'select',
          value: 'realtime',
          options: [
            { value: 'realtime', label: 'Temps réel' },
            { value: 'hourly', label: 'Toutes les heures' },
            { value: 'daily', label: 'Quotidien' },
            { value: 'weekly', label: 'Hebdomadaire' }
          ]
        }
      ]
    },
    {
      id: 'sla',
      title: 'SLA et Délais',
      icon: Clock,
      settings: [
        {
          id: 'sla-standard',
          label: 'Délai SLA standard (heures)',
          description: 'Temps maximum pour traiter une requête standard',
          type: 'number',
          value: 48
        },
        {
          id: 'sla-urgent',
          label: 'Délai SLA urgent (heures)',
          description: 'Temps maximum pour traiter une requête urgente',
          type: 'number',
          value: 24
        },
        {
          id: 'auto-escalation',
          label: 'Escalade automatique',
          description: 'Escalader automatiquement les requêtes en retard',
          type: 'toggle',
          value: true
        }
      ]
    },
    {
      id: 'security',
      title: 'Sécurité',
      icon: Shield,
      settings: [
        {
          id: '2fa',
          label: 'Authentification à deux facteurs',
          description: 'Exiger la 2FA pour tous les administrateurs',
          type: 'toggle',
          value: true
        },
        {
          id: 'session-timeout',
          label: 'Délai de session (minutes)',
          description: 'Durée avant déconnexion automatique',
          type: 'number',
          value: 30
        },
        {
          id: 'ip-whitelist',
          label: 'Liste blanche IP',
          description: 'Restreindre l\'accès admin à des IP spécifiques',
          type: 'toggle',
          value: false
        }
      ]
    },
    {
      id: 'assignments',
      title: 'Assignation automatique',
      icon: Users,
      settings: [
        {
          id: 'auto-assign',
          label: 'Assignation automatique',
          description: 'Assigner automatiquement les requêtes aux agents disponibles',
          type: 'toggle',
          value: true
        },
        {
          id: 'assign-algo',
          label: 'Algorithme d\'assignation',
          description: 'Méthode de répartition des requêtes',
          type: 'select',
          value: 'load-balance',
          options: [
            { value: 'load-balance', label: 'Équilibrage de charge' },
            { value: 'round-robin', label: 'Round-robin' },
            { value: 'skill-based', label: 'Basé sur les compétences' },
            { value: 'random', label: 'Aléatoire' }
          ]
        }
      ]
    },
    {
      id: 'ai',
      title: 'Intelligence Artificielle',
      icon: Zap,
      settings: [
        {
          id: 'ai-suggestions',
          label: 'Suggestions IA',
          description: 'Activer les recommandations intelligentes',
          type: 'toggle',
          value: true
        },
        {
          id: 'ai-auto-response',
          label: 'Réponses automatiques',
          description: 'Permettre à l\'IA de répondre automatiquement aux requêtes simples',
          type: 'toggle',
          value: false
        },
        {
          id: 'ai-model',
          label: 'Modèle IA',
          description: 'Choisir le modèle de langage utilisé',
          type: 'select',
          value: 'gemini-pro',
          options: [
            { value: 'gemini-pro', label: 'Gemini 1.5 Pro' },
            { value: 'gemini-flash', label: 'Gemini 1.5 Flash' },
            { value: 'gpt-4', label: 'GPT-4' }
          ]
        }
      ]
    },
    {
      id: 'data',
      title: 'Base de données',
      icon: Database,
      settings: [
        {
          id: 'auto-backup',
          label: 'Sauvegarde automatique',
          description: 'Sauvegarder automatiquement la base de données',
          type: 'toggle',
          value: true
        },
        {
          id: 'backup-freq',
          label: 'Fréquence des sauvegardes',
          description: 'À quelle fréquence effectuer les sauvegardes',
          type: 'select',
          value: 'daily',
          options: [
            { value: 'hourly', label: 'Toutes les heures' },
            { value: 'daily', label: 'Quotidien' },
            { value: 'weekly', label: 'Hebdomadaire' }
          ]
        },
        {
          id: 'data-retention',
          label: 'Rétention des données (jours)',
          description: 'Durée de conservation des requêtes archivées',
          type: 'number',
          value: 365
        }
      ]
    },
    {
      id: 'interface',
      title: 'Interface',
      icon: Palette,
      settings: [
        {
          id: 'theme',
          label: 'Thème',
          description: 'Apparence de l\'interface',
          type: 'select',
          value: 'light',
          options: [
            { value: 'light', label: 'Clair' },
            { value: 'dark', label: 'Sombre' },
            { value: 'auto', label: 'Automatique' }
          ]
        },
        {
          id: 'lang',
          label: 'Langue',
          description: 'Langue de l\'interface',
          type: 'select',
          value: 'fr',
          options: [
            { value: 'fr', label: 'Français' },
            { value: 'en', label: 'English' }
          ]
        },
        {
          id: 'compact-mode',
          label: 'Mode compact',
          description: 'Afficher plus d\'informations par page',
          type: 'toggle',
          value: false
        }
      ]
    }
  ]);

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (sectionId: string, settingId: string, newValue: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          settings: section.settings.map(setting => 
            setting.id === settingId ? { ...setting, value: newValue } : setting
          )
        };
      }
      return section;
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center shadow-lg">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Paramètres Système</h1>
            <p className="text-slate-500 text-sm">Configuration globale de la plateforme IUC Requêtes</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? 'Enregistré' : 'Enregistrer'}
        </button>
      </div>

      {/* Message de succès */}
      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3">
          <Check size={20} className="shrink-0" />
          <p className="text-sm font-semibold">Paramètres enregistrés avec succès !</p>
        </div>
      )}

      {/* Sections de paramètres */}
      <div className="space-y-4">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* En-tête de section */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <h2 className="font-bold text-slate-900 text-lg">{section.title}</h2>
              </div>

              {/* Paramètres */}
              <div className="divide-y divide-slate-100">
                {section.settings.map(setting => (
                  <div key={setting.id} className="p-5 flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{setting.label}</h3>
                      <p className="text-xs text-slate-500">{setting.description}</p>
                    </div>

                    {/* Contrôles selon le type */}
                    <div className="shrink-0">
                      {setting.type === 'toggle' && (
                        <button
                          onClick={() => handleSettingChange(section.id, setting.id, !setting.value)}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            setting.value ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                              setting.value ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      )}

                      {setting.type === 'select' && (
                        <select
                          value={setting.value}
                          onChange={e => handleSettingChange(section.id, setting.id, e.target.value)}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        >
                          {setting.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {setting.type === 'number' && (
                        <input
                          type="number"
                          value={setting.value}
                          onChange={e => handleSettingChange(section.id, setting.id, parseInt(e.target.value) || 0)}
                          className="w-24 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 text-center focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        />
                      )}

                      {setting.type === 'text' && (
                        <input
                          type="text"
                          value={setting.value}
                          onChange={e => handleSettingChange(section.id, setting.id, e.target.value)}
                          className="w-64 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions dangereuses */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-1">Zone dangereuse</h3>
            <p className="text-sm text-red-700 mb-4">Ces actions sont irréversibles. Utilisez avec précaution.</p>
            <div className="flex flex-wrap gap-3">
              <button className="text-sm font-bold bg-white hover:bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg transition-all">
                Réinitialiser tous les paramètres
              </button>
              <button className="text-sm font-bold bg-white hover:bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg transition-all">
                Vider le cache système
              </button>
              <button className="text-sm font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm">
                Supprimer toutes les données
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
