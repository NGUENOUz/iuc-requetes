'use client';

import Link from 'next/link';
import { Bell, Search, Menu, Command, Sun, Moon } from 'lucide-react';
import { useNotifications, useStudent } from '@/lib/hooks';
import { useTheme } from '@/components/ThemeProvider';

interface StudentHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function StudentHeader({ setSidebarOpen }: StudentHeaderProps) {
  const { student } = useStudent();
  const { theme, toggleTheme } = useTheme();
  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const roleCode = student?.role_code || 'etudiant';
  const roleLabel =
    roleCode === 'enseignant'
      ? 'Enseignant'
      : roleCode === 'personnel'
      ? 'Personnel'
      : 'Étudiant';

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-zinc-200 flex items-center justify-between gap-4 shrink-0 z-20">
      
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          className="lg:hidden w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={18} />
        </button>

        <div className="relative w-full">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Rechercher une demande, un certificat, un service..."
            className="w-full h-9 pl-9 pr-14 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-all font-sans"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-mono text-zinc-400">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Quick actions, theme, notifications & profile */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          title="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Separator */}
        <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

        {/* User preview */}
        <Link href="/profil" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center border border-zinc-800 shrink-0">
            {student?.first_name?.[0] || 'U'}{student?.last_name?.[0] || ''}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
              {student ? `${student.first_name} ${student.last_name}` : 'Utilisateur'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {roleLabel}
              </span>
              <span className="text-[10px] font-mono text-zinc-300">•</span>
              <span className="text-[10px] font-mono text-zinc-400">
                {student?.matricule || 'N/A'}
              </span>
            </div>
          </div>
        </Link>

      </div>
    </header>
  );
}
