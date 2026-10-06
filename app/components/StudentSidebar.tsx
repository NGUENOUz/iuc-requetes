'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  FileText,
  PlusCircle,
  Bell,
  User,
  FileCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  CalendarDays,
} from 'lucide-react';
import { useNotifications, useStudent } from '@/lib/hooks';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Avatar from '@/components/ui/Avatar';

const NAV_ACADEMIC = [
  { label: 'Vue générale', icon: Home, href: '/dashboard' },
  { label: 'Notes et cursus', icon: GraduationCap, href: '/cursus' },
  { label: 'Planning et salles', icon: CalendarDays, href: '/planner' },
];

const NAV_REQUESTS = [
  { label: 'Mes requêtes', icon: FileText, href: '/mes-requetes' },
  { label: 'Nouvelle demande', icon: PlusCircle, href: '/nouvelle-requete' },
];

const NAV_SECONDARY = [
  { label: 'Notifications', icon: Bell, href: '/notifications' },
  { label: 'Documents et reçus', icon: FileCheck, href: '/documents' },
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
      ? 'Enseignant'
      : roleCode === 'personnel'
      ? 'Personnel'
      : 'Étudiant';

  const studentFullName = student ? `${student.first_name} ${student.last_name}` : null;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('campuslite_user');
      localStorage.removeItem('iuc_theme');
      toast.success('Déconnexion réussie');
      router.push('/');
    } catch {
      router.push('/');
    }
  };

  const renderNavLink = (item: { label: string; icon: any; href: string }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    const isNotifications = item.href === '/notifications';

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md mx-2 transition-colors-fast select-none ${
          collapsed ? 'justify-center px-0' : ''
        } ${
          isActive
            ? 'bg-accent-soft text-accent-text'
            : 'text-fg-secondary hover:bg-surface-hover hover:text-fg'
        }`}
      >
        <Icon size={16} strokeWidth={1.5} className="shrink-0 text-current" />
        {!collapsed && (
          <span className="flex-1 flex items-center justify-between min-w-0">
            <span className="truncate">{item.label}</span>
            {isNotifications && unreadCount > 0 && (
              <span className="text-xs bg-accent text-accent-fg px-1.5 py-0.2 rounded-md font-medium">
                {unreadCount}
              </span>
            )}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 ${
          collapsed ? 'w-16' : 'w-60'
        } bg-surface-muted text-fg border-r border-line flex flex-col transition-all duration-150 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Brand header */}
        <div
          className={`h-14 px-3 border-b border-line flex items-center shrink-0 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-accent text-accent-fg flex items-center justify-center font-semibold text-xs shrink-0">
                  CL
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-fg leading-tight truncate">
                    CampusLite
                  </p>
                  <p className="text-xs text-fg-muted truncate">{roleDisplay}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="w-7 h-7 rounded-md hover:bg-surface-hover text-fg-muted hover:text-fg flex items-center justify-center transition-colors-fast cursor-pointer"
                aria-label="Réduire la navigation"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="w-7 h-7 rounded-md hover:bg-surface-hover text-fg-muted hover:text-fg flex items-center justify-center transition-colors-fast cursor-pointer"
              aria-label="Déplier la navigation"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 space-y-4 overflow-y-auto">
          <div>
            {!collapsed && (
              <p className="px-5 pb-1 text-xs text-fg-muted font-medium">
                Navigation
              </p>
            )}
            <div className="space-y-0.5">{NAV_ACADEMIC.map(renderNavLink)}</div>
          </div>

          <div>
            {!collapsed && (
              <p className="px-5 pb-1 text-xs text-fg-muted font-medium">
                Démarches
              </p>
            )}
            <div className="space-y-0.5">{NAV_REQUESTS.map(renderNavLink)}</div>
          </div>

          <div>
            {!collapsed && (
              <p className="px-5 pb-1 text-xs text-fg-muted font-medium">
                Suivi
              </p>
            )}
            <div className="space-y-0.5">{NAV_SECONDARY.map(renderNavLink)}</div>
          </div>

          <div>
            {!collapsed && (
              <p className="px-5 pb-1 text-xs text-fg-muted font-medium">
                Compte
              </p>
            )}
            <div className="space-y-0.5">{NAV_SETTINGS.map(renderNavLink)}</div>
          </div>
        </nav>

        {/* User footer */}
        <div className="p-2 border-t border-line bg-surface">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <Link
              href="/profil"
              className={`flex items-center gap-2 min-w-0 p-1 rounded-md hover:bg-surface-hover transition-colors-fast ${
                collapsed ? 'justify-center' : 'flex-1'
              }`}
            >
              <Avatar src={student?.avatar_url} name={studentFullName} size="sm" />
              {!collapsed && (
                <div className="min-w-0 leading-tight">
                  <p className="text-sm font-medium text-fg truncate">
                    {studentFullName || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-fg-muted font-mono truncate">
                    {student?.matricule || '—'}
                  </p>
                </div>
              )}
            </Link>

            {!collapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="w-8 h-8 rounded-md text-fg-muted hover:text-danger-fg hover:bg-surface-hover flex items-center justify-center transition-colors-fast cursor-pointer shrink-0"
                title="Se déconnecter"
                aria-label="Se déconnecter"
              >
                <LogOut size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-overlay z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
