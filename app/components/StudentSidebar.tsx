'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, FileText, PlusCircle, Bell,
  User, FileCheck, Settings, LogOut,
  ChevronsLeft, ChevronsRight, Shield, Sparkles
} from 'lucide-react';
import { useNotifications, useStudent } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Vue générale', icon: Home, href: '/dashboard' },
  { label: 'Mes requêtes', icon: FileText, href: '/mes-requetes' },
  { label: 'Nouvelle demande', icon: PlusCircle, href: '/nouvelle-requete' },
];

const NAV_SECONDARY = [
  { label: 'Notifications', icon: Bell, href: '/notifications' },
  { label: 'Documents & Reçus', icon: FileCheck, href: '/documents' },
];

const NAV_SETTINGS = [
  { label: 'Profil utilisateur', icon: User, href: '/profil' },
  { label: 'Paramètres', icon: Settings, href: '/parametres' },
];

interface StudentSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function StudentSidebar({ sidebarOpen, setSidebarOpen }: StudentSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { student } = useStudent();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const roleCode = student?.role_code || 'etudiant';
  const roleDisplay =
    roleCode === 'enseignant'
      ? 'Portail Enseignant'
      : roleCode === 'personnel'
      ? 'Portail Personnel'
      : 'Espace Requérant';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('iuc_user');
      toast.success('Déconnexion réussie');
      router.push('/');
    } catch {
      router.push('/');
    }
  };

  return (
    <>
      <aside
        className={`
          fixed lg:static z-40 inset-y-0 left-0
          ${collapsed ? 'w-18' : 'w-64'}
          bg-[#09090b] text-zinc-300 border-r border-zinc-800/80
          flex flex-col transition-all duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Top Header / Brand */}
        <div className={`h-16 px-3 border-b border-zinc-800/80 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black text-sm tracking-tighter shrink-0 shadow-sm">
                  IUC
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm tracking-tight text-white leading-none truncate">
                    IUC REQUÊTES
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mt-1">
                    {roleDisplay}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="w-7 h-7 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Réduire le menu"
              >
                <ChevronsLeft size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              title="Agrandir le menu"
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white flex items-center justify-center transition-all cursor-pointer group"
            >
              <ChevronsRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          
          {/* Main workspace */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Gestion
              </p>
            )}
            <div className="space-y-1">
              {NAV.map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Documents & Communication */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Suivi & Documents
              </p>
            )}
            <div className="space-y-1">
              {NAV_SECONDARY.map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href;
                const isNotifications = label === 'Notifications';
                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                    } ${collapsed ? 'justify-center px-0 relative' : ''}`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && <span className="flex-1">{label}</span>}
                    {isNotifications && unreadCount > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      }`}>
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Account */}
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Compte
              </p>
            )}
            <div className="space-y-1">
              {NAV_SETTINGS.map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

        </nav>

        {/* User Card / Footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center shrink-0">
                  {student?.first_name?.[0] || 'U'}{student?.last_name?.[0] || ''}
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-xs font-bold text-white truncate">
                    {student ? `${student.first_name} ${student.last_name}` : 'Utilisateur'}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono truncate">
                    {student?.matricule || 'IUC ID'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center shrink-0">
                {student?.first_name?.[0] || 'U'}
              </div>
            )}

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="w-7 h-7 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                title="Se déconnecter"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>

      </aside>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
