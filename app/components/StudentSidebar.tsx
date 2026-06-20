'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap, Home, FileText, PlusCircle, Bell,
  User, FileCheck, Settings, LogOut,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useNotifications } from '@/lib/hooks';

const NAV = [
  { label: 'Tableau de bord', icon: Home, href: '/dashboard' },
  { label: 'Mes requêtes', icon: FileText, href: '/mes-requetes' },
  { label: 'Nouvelle requête', icon: PlusCircle, href: '/nouvelle-requete' },
];

const NAV2 = [
  { label: 'Notifications', icon: Bell, href: '/notifications' },
];

const NAV3 = [
  { label: 'Mon profil', icon: User, href: '/profil' },
  { label: 'Documents', icon: FileCheck, href: '/documents' },
  { label: 'Paramètres', icon: Settings, href: '/parametres' },
  { label: 'Déconnexion', icon: LogOut, href: '/login' },
];

interface StudentSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function StudentSidebar({ sidebarOpen, setSidebarOpen }: StudentSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <>
      <aside className={`
        fixed lg:static z-30 inset-y-0 left-0
        ${collapsed ? 'w-16' : 'w-64'}
        glass-sidebar text-slate-300
        flex flex-col transition-all duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo + collapse button */}
        <div className={`p-4 border-b border-emerald-950/40 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {!collapsed && <GraduationCap size={30} strokeWidth={1.5} className="shrink-0 text-emerald-400" />}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-base leading-tight truncate text-white">IUC Requêtes</p>
              <p className="text-emerald-500/80 text-[11px] font-medium">Espace Étudiant</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`shrink-0 w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors text-slate-400 hover:text-white ${!collapsed ? 'ml-auto' : ''}`}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-hidden">
          {!collapsed && <p className="text-slate-500 text-[9px] uppercase tracking-widest px-3 pt-3 pb-1 font-bold">Requêtes</p>}
          {NAV.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth ${
                  isActive 
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/35 shadow-sm font-semibold' 
                    : 'hover:bg-white/[0.03] hover:text-white text-slate-400'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && label}
              </Link>
            );
          })}

          {!collapsed && <p className="text-slate-500 text-[9px] uppercase tracking-widest px-3 pt-5 pb-1 font-bold">Notifications</p>}
          {collapsed && <div className="my-2 border-t border-emerald-950/40" />}
          {NAV2.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href;
            const badge = unreadCount;
            return (
              <Link 
                key={label} 
                href={href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? label : undefined} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth ${
                  isActive 
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/35 shadow-sm font-semibold' 
                    : 'hover:bg-white/[0.03] hover:text-white text-slate-400'
                } ${collapsed ? 'justify-center relative' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && label}
                {badge > 0 && !collapsed && <span className="ml-auto bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>}
                {badge > 0 && collapsed && <span className="absolute top-1 right-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>}
              </Link>
            );
          })}

          {!collapsed && <p className="text-slate-500 text-[9px] uppercase tracking-widest px-3 pt-5 pb-1 font-bold">Mon compte</p>}
          {collapsed && <div className="my-2 border-t border-emerald-950/40" />}
          {NAV3.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href;
            return (
              <Link 
                key={label} 
                href={href}
                onClick={() => setSidebarOpen(false)}
                title={collapsed ? label : undefined} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth ${
                  isActive 
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/35 shadow-sm font-semibold' 
                    : 'hover:bg-white/[0.03] hover:text-white text-slate-400'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom logo watermark */}
        {!collapsed && (
          <div className="p-6 opacity-5 flex justify-center shrink-0 text-emerald-400">
            <GraduationCap size={44} strokeWidth={0.5} />
          </div>
        )}
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}
