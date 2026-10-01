'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, Users, Building2,
  BarChart2, Settings, Bell, Search, Menu, LogOut,
  Brain, Lightbulb, FileBarChart, ChevronsLeft, ChevronsRight,
  Sun, Moon
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useNotifications } from '@/lib/hooks';
import { RouteGuard } from '@/components/RouteGuard';
import { useTheme } from '@/components/ThemeProvider';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  isNew?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const adminNavSections: NavSection[] = [
  {
    label: 'Pilotage',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
      { href: '/admin/requetes', label: 'Registre des requêtes', icon: FileText, badge: 24 },
    ],
  },
  {
    label: 'Communauté',
    items: [
      { href: '/admin/etudiants', label: 'Étudiants inscrits', icon: Users },
      { href: '/admin/personnel', label: 'Agents & Collaborateurs', icon: Users },
      { href: '/admin/services', label: 'Services & Pôles', icon: Building2 },
    ],
  },
  {
    label: 'Analytique',
    items: [
      { href: '/admin/statistiques', label: 'Métriques & SLA', icon: BarChart2 },
      { href: '/admin/rapports', label: 'Rapports d\'activité', icon: FileBarChart },
    ],
  },
  {
    label: 'Automatisation',
    items: [
      { href: '/admin/assistant-ia', label: 'Assistant IA', icon: Brain, isNew: true },
      { href: '/admin/suggestions-ia', label: 'Suggestions IA', icon: Lightbulb },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { href: '/admin/parametres', label: 'Paramètres système', icon: Settings },
    ],
  },
];

const agentNavSections: NavSection[] = [
  {
    label: 'Espace Agent',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
      { href: '/admin/requetes', label: 'Mes requêtes assignées', icon: FileText, badge: 24 },
      { href: '/admin/statistiques', label: 'Performances & SLA', icon: BarChart2 },
    ],
  },
  {
    label: 'Assistance',
    items: [
      { href: '/admin/assistant-ia', label: 'Assistant IA', icon: Brain, isNew: true },
      { href: '/admin/suggestions-ia', label: 'Suggestions IA', icon: Lightbulb },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const isAdmin = user?.role?.name === 'admin';
  const isAgent = user?.role?.name === 'agent';
  const navSections = isAdmin ? adminNavSections : agentNavSections;

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <RouteGuard allowedRoles={['admin', 'agent']}>
      <div className="flex h-screen overflow-hidden bg-[#fafafa] dark:bg-[#09090b] font-sans antialiased text-[#171717] dark:text-[#f4f4f5] transition-colors">

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ═══════════════════════════════ SIDEBAR NOTION / VERCEL STYLE ═══════════════════════════════ */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            ${collapsed ? 'w-16' : 'w-60'}
            bg-[#fbfbfa] dark:bg-[#0c0c0e] border-r border-[#e5e5e5] dark:border-[#27272a] text-[#171717] dark:text-[#f4f4f5]
            flex flex-col transition-all duration-200 ease-in-out shrink-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          `}
        >
          {/* Workspace Switcher / Logo Header */}
          <div className={`h-14 px-3 border-b border-[#e5e5e5] dark:border-[#27272a] flex items-center shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed ? (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-[#171717] dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-[10px] font-mono shrink-0 shadow-2xs">
                    CL
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-[13px] text-[#171717] dark:text-white leading-none truncate">
                        CampusLite
                      </p>
                      <span className="text-[10px] font-mono uppercase bg-[#f0f0f0] dark:bg-[#18181b] border border-[#e5e5e5] dark:border-[#27272a] text-[#525252] dark:text-[#a1a1aa] px-1 py-0.2 rounded font-medium">
                        {isAdmin ? 'Admin' : 'Agent'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCollapsed(true)}
                  className="w-6 h-6 rounded hover:bg-[#ebebeb] dark:hover:bg-[#27272a] text-[#737373] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Réduire le menu"
                >
                  <ChevronsLeft size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setCollapsed(false)}
                title="Agrandir le menu"
                className="w-8 h-8 rounded-lg bg-[#ebebeb] dark:bg-[#18181b] hover:bg-[#171717] dark:hover:bg-white text-[#171717] dark:text-white hover:text-white dark:hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
              >
                <ChevronsRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto overflow-x-hidden no-scrollbar">
            {navSections.map((section) => (
              <div key={section.label} className="space-y-0.5">
                {!collapsed && (
                  <p className="px-2.5 py-1 text-[11px] font-semibold text-[#8a8a8a] dark:text-[#71717a] tracking-tight">
                    {section.label}
                  </p>
                )}

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
                        flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors
                        ${collapsed ? 'justify-center relative px-0' : ''}
                        ${isActive
                          ? 'bg-[#171717] text-white dark:bg-white dark:text-black font-medium shadow-2xs'
                          : 'text-[#525252] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#18181b]'
                        }
                      `}
                    >
                      <Icon size={16} className="shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      
                      {item.badge && !collapsed && (
                        <span className={`ml-auto text-[11px] font-mono px-1.5 py-0.2 rounded font-medium ${
                          isActive
                            ? 'bg-neutral-800 text-neutral-300 dark:bg-zinc-200 dark:text-zinc-800'
                            : 'bg-[#f0f0f0] dark:bg-[#18181b] text-[#737373] dark:text-[#a1a1aa] border border-[#e5e5e5] dark:border-[#27272a]'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {item.badge && collapsed && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#171717] dark:bg-white" />
                      )}

                      {item.isNew && !collapsed && (
                        <span className="text-[10px] font-mono uppercase bg-[#f0f0f0] dark:bg-[#18181b] text-[#171717] dark:text-white border border-[#e5e5e5] dark:border-[#27272a] px-1 py-0.2 rounded">
                          IA
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User & Logout Footer */}
          <div className="p-2 border-t border-[#e5e5e5] dark:border-[#27272a] bg-[#fbfbfa] dark:bg-[#0c0c0e]">
            <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : 'justify-between'} p-1.5 rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#18181b] transition-colors`}>
              {!collapsed ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#171717] dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center shrink-0">
                    {user?.first_name?.[0] || 'A'}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="text-[12px] font-semibold text-[#171717] dark:text-white truncate">
                      {user ? `${user.first_name} ${user.last_name}` : 'Administrateur'}
                    </p>
                    <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa] truncate font-mono">
                      {user?.email || 'admin@iuc.cm'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#171717] dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.first_name?.[0] || 'A'}
                </div>
              )}

              {!collapsed && (
                <button
                  onClick={handleLogout}
                  title="Déconnexion"
                  className="w-6 h-6 rounded hover:bg-[#e5e5e5] dark:hover:bg-[#27272a] text-[#737373] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ═══════════════════════════════ MAIN CONTENT AREA ═══════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#09090b]">

          {/* Clean Vercel-Style Top Header */}
          <header className="h-14 px-6 bg-white dark:bg-[#0c0c0e] border-b border-[#e5e5e5] dark:border-[#27272a] flex items-center justify-between gap-4 shrink-0 z-10 transition-colors">
            
            {/* Left: Mobile hamburger & search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <button
                className="lg:hidden w-8 h-8 rounded-md border border-[#e5e5e5] dark:border-[#27272a] flex items-center justify-center text-[#737373] dark:text-[#a1a1aa] hover:bg-[#fafafa] dark:hover:bg-[#18181b]"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={16} />
              </button>

              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher une requête, un étudiant, un service..."
                  className="w-full h-8 pl-8 pr-12 bg-[#f5f5f5] dark:bg-[#18181b] hover:bg-[#f0f0f0] dark:hover:bg-[#202024] focus:bg-white dark:focus:bg-[#121215] border border-[#e5e5e5] dark:border-[#27272a] focus:border-[#171717] dark:focus:border-white rounded-md text-[13px] text-[#171717] dark:text-[#f4f4f5] placeholder:text-[#a3a3a3] outline-none transition-all font-sans"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#737373] dark:text-[#a1a1aa] font-mono border border-[#e5e5e5] dark:border-[#27272a] bg-white dark:bg-[#121215] px-1 rounded hidden sm:block">
                  Ctrl+K
                </span>
              </div>
            </div>

            {/* Right: Theme Toggle, Notifications & Quick Profile */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Day / Night Mode Button */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-md border border-[#e5e5e5] dark:border-[#27272a] flex items-center justify-center text-[#525252] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:bg-[#fafafa] dark:hover:bg-[#18181b] transition-colors cursor-pointer"
                title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              <Link
                href="/notifications"
                className="relative w-8 h-8 rounded-md border border-[#e5e5e5] dark:border-[#27272a] flex items-center justify-center text-[#525252] dark:text-[#a1a1aa] hover:text-[#171717] dark:hover:text-white hover:bg-[#fafafa] dark:hover:bg-[#18181b] transition-colors"
                title="Notifications"
              >
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#171717] dark:bg-white text-white dark:text-black text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <div className="h-4 w-px bg-[#e5e5e5] dark:bg-[#27272a] hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#171717] dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.first_name?.[0] || 'A'}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-[12px] font-semibold text-[#171717] dark:text-white">
                    {user ? `${user.first_name} ${user.last_name}` : 'Wilfried Nguenou'}
                  </p>
                  <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa] font-mono">
                    {isAdmin ? 'Administrateur Général' : 'Agent de Service'}
                  </p>
                </div>
              </div>
            </div>

          </header>

          {/* Children Viewport */}
          <main className="flex-1 overflow-y-auto no-scrollbar bg-white dark:bg-[#09090b] text-[#171717] dark:text-[#f4f4f5]">
            {children}
          </main>

        </div>
      </div>
    </RouteGuard>
  );
}
