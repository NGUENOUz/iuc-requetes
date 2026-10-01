'use client';

import { useState } from 'react';
import StudentSidebar from '../components/StudentSidebar';
import StudentHeader from '../components/StudentHeader';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/70 dark:bg-[#09090b] text-zinc-900 dark:text-[#f4f4f5] font-sans relative selection:bg-orange-500 selection:text-white transition-colors duration-200">
      {/* Background Ambient Glows - Warm Orange Sunset Aura */}
      <div className="ambient-glow-orange top-0 left-1/4 -translate-x-1/2 opacity-35 dark:opacity-40 pointer-events-none" />
      <div className="ambient-glow-amber bottom-10 right-10 opacity-25 dark:opacity-30 pointer-events-none" />

      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <StudentHeader setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto no-scrollbar border-0 outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
