'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, Menu, Sun, Moon } from 'lucide-react';
import { useNotifications, useStudent } from '@/lib/hooks';
import { useTheme } from '@/components/ThemeProvider';
import GuidedTourModal from '@/components/GuidedTourModal';
import Avatar from '@/components/ui/Avatar';

interface StudentHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function StudentHeader({ setSidebarOpen }: StudentHeaderProps) {
  const { student } = useStudent();
  const { theme, toggleTheme } = useTheme();
  const [showTour, setShowTour] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const roleCode = student?.role_code || 'etudiant';
  const roleLabel =
    roleCode === 'enseignant'
      ? 'Enseignant'
      : roleCode === 'personnel'
      ? 'Personnel'
      : 'Étudiant';

  const studentFullName = student ? `${student.first_name} ${student.last_name}` : null;

  return (
    <>
      <header className="h-14 px-4 sm:px-6 bg-surface border-b border-line flex items-center justify-between gap-4 shrink-0 z-20">
        {/* Left: Mobile toggle & Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            type="button"
            className="lg:hidden w-8 h-8 rounded-md border border-line flex items-center justify-center text-fg-secondary hover:bg-surface-hover hover:text-fg transition-colors-fast cursor-pointer"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={16} strokeWidth={1.5} />
          </button>

          <div className="relative w-full">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Rechercher une note, une salle, un cours, une demande..."
              className="w-full h-8 pl-9 pr-3 bg-surface-muted border border-line rounded-md text-sm text-fg placeholder:text-fg-muted focus:border-accent focus:bg-surface focus-visible:outline-2 focus-visible:outline-accent transition-colors-fast"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowTour(true)}
            className="hidden sm:inline-flex items-center text-xs text-fg-secondary hover:text-fg px-2.5 py-1 rounded-md hover:bg-surface-hover transition-colors-fast cursor-pointer border border-line"
          >
            Guide
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-md border border-line flex items-center justify-center text-fg-secondary hover:text-fg hover:bg-surface-hover transition-colors-fast cursor-pointer"
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            aria-label="Basculer le thème"
          >
            {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
          </button>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative w-8 h-8 rounded-md border border-line flex items-center justify-center text-fg-secondary hover:text-fg hover:bg-surface-hover transition-colors-fast"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={16} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-fg text-[10px] font-medium rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          <div className="h-4 w-px bg-line hidden sm:block mx-1" />

          {/* Profile header summary */}
          <Link
            href="/profil"
            className="flex items-center gap-2 p-1 rounded-md hover:bg-surface-hover transition-colors-fast"
            title="Mon profil"
          >
            <Avatar src={student?.avatar_url} name={studentFullName} size="sm" />
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-medium text-fg truncate max-w-[140px]">
                {studentFullName || 'Étudiant'}
              </p>
              <p className="text-xs text-fg-muted font-mono truncate">
                {student?.matricule || roleLabel}
              </p>
            </div>
          </Link>
        </div>
      </header>

      <GuidedTourModal forceOpen={showTour} onClose={() => setShowTour(false)} />
    </>
  );
}
