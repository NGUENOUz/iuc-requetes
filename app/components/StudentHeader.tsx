'use client';

import Link from 'next/link';
import { Bell, User, Search, ChevronsRight } from 'lucide-react';

interface StudentHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function StudentHeader({ setSidebarOpen }: StudentHeaderProps) {
  return (
    <header className="glass-header h-16 px-6 flex items-center gap-4 shrink-0 z-10">
      <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
        <ChevronsRight size={22} />
      </button>

      <div className="flex-1 min-w-0 max-w-lg relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          placeholder="Rechercher..."
          className="w-full h-10 bg-slate-100 rounded-xl pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Link href="/notifications" className="relative">
          <Bell size={20} className="text-slate-600 hover:text-emerald-600 transition-colors" />
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">3</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
            <User size={20} className="text-emerald-700" />
          </div>
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-sm font-bold text-slate-900">NGUENOU Wilfried</p>
            <p className="text-xs text-slate-500">Étudiant</p>
          </div>
        </div>
      </div>
    </header>
  );
}
