'use client';

import { useState, useRef } from 'react';
import { Settings, Save, Bell, Mail, Clock, Shield, Database, Zap, Users, Palette, Check, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '@/components/ThemeProvider';

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
      id: 'database',
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
            { value: 'light', label: 'Clair (Noir & Blanc)' },
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

  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSettingChange = (sectionId: string, settingId: string, newValue: any) => {
    if (settingId === 'theme') {
      setTheme(newValue === 'dark' ? 'dark' : 'light');
      toast.success(`Mode ${newValue === 'dark' ? 'sombre' : 'clair'} activé`);
    }

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

  const handleExportDatabase = () => {
    window.location.href = '/api/admin/backup';
    toast.success('Téléchargement de la base locale JSON lancé');
  };

  const handleImportDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        toast.success('Base de données restaurée avec succès !');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error('Erreur lors de la restauration');
      }
    } catch {
      toast.error('Fichier JSON invalide');
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e5e5] pb-5">
        <div>
          <h1 className="text-xl font-semibold text-[#171717] tracking-tight">Paramètres du Système</h1>
          <p className="text-[#737373] text-sm mt-0.5">Configuration globale de l&apos;instance IUC Requêtes</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#171717] hover:bg-[#262626] text-white font-medium text-xs px-4 py-2 rounded-md transition-colors"
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Enregistré' : 'Enregistrer les modifications'}
        </button>
      </div>

      {/* Message de succès */}
      {saved && (
        <div className="bg-[#f5f5f5] border border-[#e5e5e5] text-[#171717] rounded-md p-3.5 flex items-center gap-2.5 text-xs font-medium">
          <Check size={16} className="text-[#171717] shrink-0" />
          <span>Paramètres sauvegardés avec succès.</span>
        </div>
      )}

      {/* Sections de paramètres */}
      <div className="space-y-4">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="bg-white rounded-md border border-[#e5e5e5] overflow-hidden">
              {/* En-tête de section */}
              <div className="bg-[#fafafa] border-b border-[#e5e5e5] px-4 py-3 flex items-center gap-2.5">
                <Icon size={15} className="text-[#737373]" />
                <h2 className="font-semibold text-[#171717] text-sm">{section.title}</h2>
              </div>

              {/* Paramètres */}
              <div className="divide-y divide-[#f0f0f0]">
                {section.settings.map(setting => (
                  <div key={setting.id} className="p-4 flex items-center justify-between gap-6 hover:bg-[#fafafa]/50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-[#171717] text-xs mb-0.5">{setting.label}</h3>
                      <p className="text-[11px] text-[#737373]">{setting.description}</p>
                    </div>

                    {/* Contrôles selon le type */}
                    <div className="shrink-0">
                      {setting.type === 'toggle' && (
                        <button
                          onClick={() => handleSettingChange(section.id, setting.id, !setting.value)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${
                            setting.value ? 'bg-[#171717]' : 'bg-[#e5e5e5]'
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                              setting.value ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      )}

                      {setting.type === 'select' && (
                        <select
                          value={setting.value}
                          onChange={e => handleSettingChange(section.id, setting.id, e.target.value)}
                          className="px-3 py-1.5 border border-[#e5e5e5] rounded-md text-xs font-medium text-[#171717] bg-white focus:outline-none focus:border-[#171717]"
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
                          className="w-20 px-3 py-1.5 border border-[#e5e5e5] rounded-md text-xs font-medium text-[#171717] text-center focus:outline-none focus:border-[#171717]"
                        />
                      )}

                      {setting.type === 'text' && (
                        <input
                          type="text"
                          value={setting.value}
                          onChange={e => handleSettingChange(section.id, setting.id, e.target.value)}
                          className="w-56 px-3 py-1.5 border border-[#e5e5e5] rounded-md text-xs font-medium text-[#171717] focus:outline-none focus:border-[#171717]"
                        />
                      )}
                    </div>
                  </div>
                ))}

                {section.id === 'database' && (
                  <div className="p-4 bg-[#fafafa] border-t border-[#e5e5e5] flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-[#171717] text-xs">Gestion locale des données (JSON)</h4>
                      <p className="text-[11px] text-[#737373] mt-0.5">Exportez une sauvegarde complète ou restaurez des données de démonstration.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportDatabase}
                        accept=".json"
                        className="hidden"
                      />
                      <button
                        onClick={handleExportDatabase}
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f5f5f5] text-[#171717] font-medium text-xs rounded-md border border-[#e5e5e5] transition-colors"
                      >
                        <Download size={13} className="text-[#737373]" />
                        Exporter (JSON)
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#262626] text-white font-medium text-xs rounded-md transition-colors"
                      >
                        <Upload size={13} />
                        Importer / Restaurer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions de réinitialisation */}
      <div className="bg-white border border-[#e5e5e5] rounded-md p-4">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-[#737373] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-xs text-[#171717] mb-1">Actions d&apos;administration système</h3>
            <p className="text-[11px] text-[#737373] mb-3">Opérations de maintenance des caches et des index.</p>
            <div className="flex flex-wrap gap-2">
              <button className="text-xs font-medium bg-white hover:bg-[#fafafa] text-[#171717] border border-[#e5e5e5] px-3 py-1.5 rounded-md transition-colors">
                Réinitialiser les paramètres
              </button>
              <button className="text-xs font-medium bg-white hover:bg-[#fafafa] text-[#171717] border border-[#e5e5e5] px-3 py-1.5 rounded-md transition-colors">
                Purger le cache mémoire
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
