'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, Menu, Command, Sun, Moon, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useNotifications, useStudent } from '@/lib/hooks';
import { useTheme } from '@/components/ThemeProvider';
import GuidedTourModal from '@/components/GuidedTourModal';

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

  // Photo de l'étudiant avec fallback
  const avatarUrl =
    student?.avatar_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  return (
    <>
      <header className="h-16 px-4 sm:px-6 bg-white/85 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 flex items-center justify-between gap-4 shrink-0 z-20 transition-colors">
        
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            className="lg:hidden w-8 h-8 rounded-lg border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
              placeholder="Rechercher une note, une salle, un cours, une demande..."
              className="w-full h-9 pl-9 pr-14 bg-zinc-50 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-all font-sans"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/10 text-[10px] font-mono text-zinc-400">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right: Quick actions, theme, guide popup, notifications & profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Guide Interactif Popup Trigger Button (Orange Accent) */}
          <button
            onClick={() => setShowTour(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Guide interactif & astuces"
          >
            <Sparkles size={13} className="text-orange-500 animate-pulse" />
            <span>Guide Interactif</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative w-8 h-8 rounded-lg border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors"
          title="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Separator */}
        <div className="h-5 w-px bg-zinc-200 dark:bg-white/10 hidden sm:block" />

        {/* User preview - Rich Profile Card moved from sidebar */}
        <Link
          href="/profil"
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/80 dark:bg-white/[0.04] hover:border-orange-500/40 hover:bg-orange-50/40 dark:hover:bg-white/[0.08] transition-all group cursor-pointer shadow-2xs"
          title="Mon profil et identifiants"
        >
          <div className="relative shrink-0">
            <img
              src={avatarUrl}
              alt={student?.first_name || 'Utilisateur'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-500/30 group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span
              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#09090b]"
              title="En ligne"
            />
          </div>
          <div className="hidden sm:block text-left leading-tight pr-1">
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-xs text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate max-w-[130px]">
                {student ? `${student.first_name} ${student.last_name}` : 'Kevin Fotso'}
              </p>
              <CheckCircle2 size={12} className="text-orange-500 shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase font-semibold">
                {roleLabel}
              </span>
              <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                {student?.matricule || '22IUC01452'}
              </span>
            </div>
          </div>
        </Link>

      </div>
    </header>

    {/* Guided Onboarding Popup Modal */}
    <GuidedTourModal forceOpen={showTour} onClose={() => setShowTour(false)} />
  </>
);
}

