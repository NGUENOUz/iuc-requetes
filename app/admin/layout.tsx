'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCog,
  Building2,
  Tag,
  Flag,
  BarChart2,
  FileBarChart,
  Zap,
  Brain,
  Lightbulb,
  TrendingUp,
  Settings,
  Activity,
  LogOut,
  Bell,
  Mail,
  Search,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Menu,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
  isNew?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: 'GESTION',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
      { href: '/admin/requetes', label: 'Requêtes', icon: FileText, badge: 24 },
      { href: '/admin/etudiants', label: 'Étudiants', icon: Users },
      { href: '/admin/personnel', label: 'Personnel', icon: UserCog },
      { href: '/admin/services', label: 'Services / Départements', icon: Building2 },
    ],
  },
  {
    label: 'ANALYSE & RAPPORTS',
    items: [
      { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart2 },
      { href: '/admin/rapports', label: 'Rapports', icon: FileBarChart },
    ],
  },
  {
    label: 'IA & AUTOMATISATION',
    items: [
      { href: '/admin/assistant-ia', label: 'Assistant IA', icon: Brain, isNew: true },
      { href: '/admin/suggestions-ia', label: 'Suggestions IA', icon: Lightbulb },
      { href: '/admin/analyse-predictive', label: 'Analyse prédictive', icon: TrendingUp },
    ],
  },
  {
    label: 'PARAMÈTRES',
    items: [
      { href: '/admin/parametres', label: 'Paramètres système', icon: Settings },
      { href: '/admin/journal', label: "Journal d'activité", icon: Activity },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">

      {/* ─── Overlay mobile ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════════════════════════ SIDEBAR ═══════════════════════════════ */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          ${collapsed ? 'w-16' : 'w-64'}
          bg-gradient-to-b from-emerald-900 to-green-700 text-white
          flex flex-col transition-all duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* ── Logo + bouton collapse ── */}
        <div className={`p-4 border-b border-white/10 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {!collapsed && (
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <LayoutDashboard size={18} className="text-white" />
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base leading-tight truncate text-white">IUC Requêtes</p>
              <p className="text-green-300 text-xs">Panel Administrateur</p>
            </div>
          )}
          {/* Bouton réduction sidebar */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`shrink-0 w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-green-200 hover:text-white ${!collapsed ? 'ml-auto' : ''}`}
            title={collapsed ? 'Déplier la sidebar' : 'Réduire la sidebar'}
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto overflow-x-hidden">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="text-green-300 text-[10px] uppercase tracking-widest px-3 pt-1 pb-1.5 font-bold">
                  {section.label}
                </p>
              )}
              {collapsed && <div className="my-1 border-t border-white/10" />}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium
                        ${collapsed ? 'justify-center relative' : ''}
                        ${isActive
                          ? 'bg-emerald-500 text-white'
                          : 'text-green-100 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {/* Badge */}
                      {item.badge && !collapsed && (
                        <span className="ml-auto bg-white text-emerald-800 text-[10px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                      {item.badge && collapsed && (
                        <span className="absolute top-1 right-1 bg-white text-emerald-800 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                      {/* Badge Nouveau */}
                      {item.isNew && !collapsed && (
                        <span className="ml-auto bg-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          Nouveau
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Déconnexion ── */}
        <div className={`p-3 border-t border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
          <button
            title={collapsed ? 'Déconnexion' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-green-100 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium ${collapsed ? 'justify-center w-10' : 'w-full'}`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════ MAIN ═══════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── HEADER ── */}
        <header className="bg-white border-b border-slate-200 px-6 h-16 flex items-center gap-4 shrink-0 z-10">

          {/* Bouton hamburger mobile */}
          <button
            className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={22} />
          </button>

          {/* Barre de recherche */}
          <div className="flex-1 max-w-lg relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              placeholder="Rechercher une requête, un étudiant, un service..."
              className="w-full h-10 bg-slate-100 rounded-xl pl-9 pr-20 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 border border-transparent focus:border-emerald-300 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono hidden sm:block select-none">
              Ctrl+K
            </span>
          </div>

          {/* Actions à droite */}
          <div className="ml-auto flex items-center gap-2">

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Messages */}
            <button className="relative w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all">
              <Mail size={18} />
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Séparateur + Profil */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 ml-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shrink-0">
                <UserCog size={15} className="text-white" />
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <p className="text-xs font-bold text-slate-900">Administrateur</p>
                <p className="text-[10px] text-slate-400 font-medium">Super Admin</p>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* ── CONTENU ── */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
