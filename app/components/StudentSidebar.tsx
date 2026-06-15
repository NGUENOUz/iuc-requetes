'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap, Home, FileText, PlusCircle, Bell,
  User, FileCheck, Settings, LogOut,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';

const NAV = [
  { label: 'Tableau de bord', icon: Home, href: '/dashboard' },
  { label: 'Mes requêtes', icon: FileText, href: '/mes-requetes' },
  { label: 'Nouvelle requête', icon: PlusCircle, href: '/nouvelle-requete' },
];

const NAV2 = [
  { label: 'Notifications', icon: Bell, badge: 3, href: '/notifications' },
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

  return (
    <>
      <aside className={`
        fixed lg:static z-30 inset-y-0 left-0
        ${collapsed ? 'w-16' : 'w-64'}
        bg-gradient-to-b from-emerald-900 to-green-700 text-white
        flex flex-col transition-all duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo + collapse button */}
        <div className={`p-4 border-b border-white/10 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {!collapsed && <GraduationCap size={32} strokeWidth={1.5} className="shrink-0" />}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight truncate">IUC Requêtes</p>
              <p className="text-green-300 text-xs">Plateforme officielle</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`shrink-0 w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors ${!collapsed ? 'ml-auto' : ''}`}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-hidden">
          {!collapsed && <p className="text-green-300 text-[10px] uppercase tracking-widest px-3 pt-2 pb-1">Requêtes</p>}
          {NAV.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === href ? 'bg-emerald-500 text-white' : 'hover:bg-white/10 text-green-100'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </Link>
          ))}

          {!collapsed && <p className="text-green-300 text-[10px] uppercase tracking-widest px-3 pt-4 pb-1">Notifications</p>}
          {collapsed && <div className="my-1 border-t border-white/10" />}
          {NAV2.map(({ label, icon: Icon, badge, href }) => (
            <Link 
              key={label} 
              href={href}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? label : undefined} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 text-green-100 transition-colors ${collapsed ? 'justify-center relative' : ''}`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
              {badge && !collapsed && <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>}
              {badge && collapsed && <span className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>}
            </Link>
          ))}

          {!collapsed && <p className="text-green-300 text-[10px] uppercase tracking-widest px-3 pt-4 pb-1">Mon compte</p>}
          {collapsed && <div className="my-1 border-t border-white/10" />}
          {NAV3.map(({ label, icon: Icon, href }) => (
            <Link 
              key={label} 
              href={href}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? label : undefined} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 text-green-100 transition-colors ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </Link>
          ))}
        </nav>

        {/* Bottom logo watermark */}
        {!collapsed && (
          <div className="p-4 opacity-20 flex justify-center shrink-0">
            <GraduationCap size={48} strokeWidth={0.5} />
          </div>
        )}
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}
