'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, FileText, PlusCircle, Bell,
  User, FileCheck, Settings, LogOut,
  ChevronsLeft, ChevronsRight, Sparkles,
  GraduationCap, CalendarDays, CheckCircle2
} from 'lucide-react';
import { useNotifications, useStudent } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const NAV_ACADEMIC = [
  { label: 'Vue générale', icon: Home, href: '/dashboard' },
  { label: 'Notes & Cursus', icon: GraduationCap, href: '/cursus', badge: 'SN/CC' },
  { label: 'Planner & Salles', icon: CalendarDays, href: '/planner' },
];

const NAV_REQUESTS = [
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
      : 'Espace Universitaire';

  // Photo de l'étudiant avec fallback de haute qualité
  const avatarUrl =
    student?.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('campuslite_user');
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
          ${collapsed ? 'w-20' : 'w-64'}
          bg-slate-100/95 dark:bg-[#0c1017] text-zinc-600 dark:text-zinc-300
          border-r border-zinc-200/80 dark:border-white/[0.06]
          flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Top Header / Brand Logo */}
        <div className={`h-16 px-4 border-b border-zinc-200/80 dark:border-white/[0.06] flex items-center shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-xs tracking-tight shrink-0 shadow-md shadow-orange-500/25 ring-2 ring-orange-500/20">
                  CL
                </div>
                <div className="min-w-0">
                  <p className="font-black text-sm tracking-tight text-zinc-900 dark:text-white leading-none truncate">
                    CampusLite
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-orange-600 dark:text-orange-400 mt-1 font-semibold truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    {roleDisplay}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="w-7 h-7 rounded-lg hover:bg-zinc-200/70 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Réduire le menu"
              >
                <ChevronsLeft size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              title="Agrandir le menu"
              className="w-9 h-9 rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center transition-all cursor-pointer group"
            >
              <ChevronsRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Navigation Section with Concave Scoop Curves ("Effet Creux") */}
        <nav className="flex-1 py-4 space-y-5 overflow-y-auto overflow-x-hidden no-scrollbar">
          
          {/* Vie Académique & Cursus */}
          <div>
            {!collapsed && (
              <p className="px-5 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold flex items-center gap-1.5">
                <Sparkles size={11} className="text-orange-500 dark:text-orange-400" />
                Vie Universitaire
              </p>
            )}
            <div className="space-y-1">
              {NAV_ACADEMIC.map(({ label, icon: Icon, href, badge }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? label : undefined}
                    className={`
                      group relative flex items-center gap-3.5 py-2.5 text-xs font-semibold transition-all duration-200
                      ${collapsed ? 'justify-center px-0 mx-2 rounded-xl' : 'pl-5 pr-4'}
                      ${
                        isActive
                          ? collapsed
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 font-bold'
                            : 'sidebar-item-scoop'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:translate-x-1'
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? collapsed ? 'text-white' : 'text-orange-600 dark:text-orange-400'
                          : 'text-zinc-400 dark:text-zinc-500 group-hover:text-orange-500'
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{label}</span>
                        {badge && (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            isActive 
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' 
                              : 'bg-zinc-200/80 text-zinc-600 dark:bg-white/10 dark:text-zinc-400'
                          }`}>
                            {badge}
                          </span>
                        )}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Requêtes & Démarches */}
          <div>
            {!collapsed && (
              <p className="px-5 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold">
                Requêtes & Démarches
              </p>
            )}
            <div className="space-y-1">
              {NAV_REQUESTS.map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    title={collapsed ? label : undefined}
                    className={`
                      group relative flex items-center gap-3.5 py-2.5 text-xs font-semibold transition-all duration-200
                      ${collapsed ? 'justify-center px-0 mx-2 rounded-xl' : 'pl-5 pr-4'}
                      ${
                        isActive
                          ? collapsed
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 font-bold'
                            : 'sidebar-item-scoop'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:translate-x-1'
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? collapsed ? 'text-white' : 'text-orange-600 dark:text-orange-400'
                          : 'text-zinc-400 dark:text-zinc-500 group-hover:text-orange-500'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Documents & Communication */}
          <div>
            {!collapsed && (
              <p className="px-5 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
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
                    className={`
                      group relative flex items-center gap-3.5 py-2.5 text-xs font-semibold transition-all duration-200
                      ${collapsed ? 'justify-center px-0 mx-2 rounded-xl' : 'pl-5 pr-4'}
                      ${
                        isActive
                          ? collapsed
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 font-bold'
                            : 'sidebar-item-scoop'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:translate-x-1'
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? collapsed ? 'text-white' : 'text-orange-600 dark:text-orange-400'
                          : 'text-zinc-400 dark:text-zinc-500 group-hover:text-orange-500'
                      }`}
                    />
                    {!collapsed && <span className="truncate flex-1">{label}</span>}
                    {isNotifications && unreadCount > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700'
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
              <p className="px-5 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
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
                    className={`
                      group relative flex items-center gap-3.5 py-2.5 text-xs font-semibold transition-all duration-200
                      ${collapsed ? 'justify-center px-0 mx-2 rounded-xl' : 'pl-5 pr-4'}
                      ${
                        isActive
                          ? collapsed
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 font-bold'
                            : 'sidebar-item-scoop'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:translate-x-1'
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? collapsed ? 'text-white' : 'text-orange-600 dark:text-orange-400'
                          : 'text-zinc-400 dark:text-zinc-500 group-hover:text-orange-500'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>

        </nav>

        {/* User Card / Footer */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-white/[0.06] bg-slate-200/50 dark:bg-[#090d13]">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-white/20 shrink-0"
                />
                <div className="min-w-0 leading-tight">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {student ? `${student.first_name} ${student.last_name}` : 'Kevin Fotso'}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                    {student?.matricule || '22G00142'}
                  </p>
                </div>
              </div>
            ) : (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-white/20 shrink-0"
              />
            )}

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-xl hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                title="Se déconnecter"
              >
                <LogOut size={15} />
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
