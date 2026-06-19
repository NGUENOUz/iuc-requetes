'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap, Home, FileText, PlusCircle, Bell,
  User, FileCheck, Settings, LogOut, Search,
  Clock, CheckCircle, XCircle, TrendingUp, ChevronRight, Shield, Plus,
  ChevronsLeft, ChevronsRight, MessageCircle, LayoutGrid, Loader2
} from 'lucide-react';
import { useStudent, useStudentRequests } from '@/lib/hooks';

const CHART_POINTS = [
  { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 2.5 }, { x: 3, y: 2 },
  { x: 4, y: 3.5 }, { x: 5, y: 3 }, { x: 6, y: 5 }, { x: 7, y: 6 },
  { x: 8, y: 7 }, { x: 9, y: 9 }, { x: 10, y: 10 }, { x: 11, y: 12 },
];

const W = 500, H = 160, PAD = 20, MAX_Y = 12;
const cx = (x: number) => PAD + (x / 11) * (W - PAD * 2);
const cy = (y: number) => H - PAD - (y / MAX_Y) * (H - PAD * 2);

const polyline = CHART_POINTS.map(p => `${cx(p.x)},${cy(p.y)}`).join(' ');
const area = `M${cx(0)},${cy(0)} ` + CHART_POINTS.map(p => `L${cx(p.x)},${cy(p.y)}`).join(' ') + ` L${cx(11)},${H - PAD} L${cx(0)},${H - PAD} Z`;

const NAV = [
  { label: 'Tableau de bord', icon: Home, active: true, href: '/dashboard' },
  { label: 'Mes requêtes', icon: FileText, href: '/mes-requetes' },
  { label: 'Nouvelle requête', icon: PlusCircle, href: '/nouvelle-requete' },
];
const NAV2 = [
  { label: 'Notifications', icon: Bell, badge: 3 },
];
const NAV3 = [
  { label: 'Mon profil', icon: User },
  { label: 'Documents', icon: FileCheck },
  { label: 'Paramètres', icon: Settings },
  { label: 'Déconnexion', icon: LogOut },
];

// Fonction pour obtenir l'icône de catégorie
const getCategoryIcon = (iconName: string | null) => {
  switch (iconName) {
    case 'graduation-cap': return GraduationCap;
    case 'file-check': return FileCheck;
    case 'layout-grid': return LayoutGrid;
    case 'file-text': return FileText;
    default: return Bell;
  }
};

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return `Soumis le ${date.toLocaleDateString('fr-FR', options)}`;
};

// Fonction pour obtenir la couleur du statut
const getStatusColor = (statusName: string) => {
  switch (statusName) {
    case 'En attente': return 'bg-blue-100 text-blue-700';
    case 'En cours': return 'bg-yellow-100 text-yellow-700';
    case 'Résolue': return 'bg-emerald-100 text-emerald-700';
    case 'Rejetée': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Récupérer les données de l'étudiant
  const { student, loading: studentLoading, error: studentError } = useStudent();
  const { requests, stats, loading: requestsLoading, error: requestsError } = useStudentRequests(student?.id);

  // Les 5 dernières requêtes
  const latestRequests = requests.slice(0, 5);

  // Créer les stats pour les cartes
  const STATS = [
    { label: 'Total requêtes', value: stats.total, sub: 'Toutes vos demandes', icon: FileText, color: 'bg-emerald-50/70 text-emerald-600 border border-emerald-100/50', trend: '↗' },
    { label: 'En attente', value: stats.pending, sub: 'En attente de traitement', icon: Clock, color: 'bg-blue-50/70 text-blue-600 border border-blue-100/50', trend: '↗' },
    { label: 'En cours', value: stats.in_progress, sub: 'En cours de traitement', icon: Clock, color: 'bg-amber-50/70 text-amber-600 border border-amber-100/50', trend: '↗' },
    { label: 'Résolues', value: stats.resolved, sub: 'Traitées avec succès', icon: CheckCircle, color: 'bg-emerald-100/70 text-emerald-700 border border-emerald-200/50', trend: '↗' },
    { label: 'Rejetées', value: stats.rejected, sub: 'Non acceptées', icon: XCircle, color: 'bg-rose-50/70 text-rose-600 border border-rose-100/50', trend: '↘' },
  ];

  // Guide tooltips — affichés une seule fois
  const [mobileGuide, setMobileGuide] = useState<'menu' | 'chat' | null>(null);
  const [desktopChatGuide, setDesktopChatGuide] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem('iuc_guide_done');
    if (!done) {
      if (window.innerWidth < 1024) {
        setMobileGuide('menu');
      } else {
        // Desktop : guide chat après 1.5s
        const t = setTimeout(() => setDesktopChatGuide(true), 1500);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const dismissMobileGuide = (next: 'chat' | null) => {
    if (next === 'chat') {
      setMobileGuide('chat');
    } else {
      setMobileGuide(null);
      localStorage.setItem('iuc_guide_done', '1');
    }
  };

  const dismissDesktopChatGuide = () => {
    setDesktopChatGuide(false);
    localStorage.setItem('iuc_guide_done', '1');
  };

  // Afficher un loader pendant le chargement
  if (studentLoading || requestsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  // Afficher une erreur si nécessaire
  if (studentError || requestsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-900 font-bold text-lg mb-2">Erreur de chargement</p>
          <p className="text-slate-600">{studentError || requestsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static z-30 inset-y-0 left-0
        ${collapsed ? 'w-16' : 'w-64'}
        glass-sidebar text-slate-300
        flex flex-col transition-all duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>

        {/* Logo + collapse button */}
        <div className={`p-4 border-b border-emerald-950/40 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {!collapsed && <img src="https://res.cloudinary.com/dcsl6xhli/image/upload/v1781788982/images-removebg-preview_epbah4.png" alt="IUC logo" className="h-8 w-8 object-contain" />}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-base leading-tight truncate text-white">IUC Requêtes</p>
              <p className="text-emerald-500/80 text-[11px] font-semibold">Espace Étudiant</p>
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
          {NAV.map(({ label, icon: Icon, active, href }) => (
            <Link
              key={label}
              href={href}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth ${
                active 
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-50/20 shadow-sm font-semibold' 
                  : 'hover:bg-white/[0.03] hover:text-white text-slate-400'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </Link>
          ))}

          {!collapsed && <p className="text-slate-500 text-[9px] uppercase tracking-widest px-3 pt-5 pb-1 font-bold">Notifications</p>}
          {collapsed && <div className="my-2 border-t border-emerald-950/40" />}
          {NAV2.map(({ label, icon: Icon, badge }) => (
            <button key={label} title={collapsed ? label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/[0.03] hover:text-white text-slate-400 transition-smooth ${collapsed ? 'justify-center relative' : ''}`}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
              {badge && !collapsed && <span className="ml-auto bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>}
              {badge && collapsed && <span className="absolute top-1 right-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>}
            </button>
          ))}

          {!collapsed && <p className="text-slate-500 text-[9px] uppercase tracking-widest px-3 pt-5 pb-1 font-bold">Mon compte</p>}
          {collapsed && <div className="my-2 border-t border-emerald-950/40" />}
          {NAV3.map(({ label, icon: Icon }) => (
            <button key={label} title={collapsed ? label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/[0.03] hover:text-white text-slate-400 transition-smooth ${collapsed ? 'justify-center' : ''}`}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </button>
          ))}
        </nav>

        {/* Bottom logo watermark */}
        {!collapsed && (
          <div className="p-6 opacity-5 flex justify-center shrink-0 text-emerald-400">
            <img src="https://res.cloudinary.com/dcsl6xhli/image/upload/v1781788982/images-removebg-preview_epbah4.png" alt="IUC logo" className="h-12 w-12 object-contain" />
          </div>
        )}
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* HEADER */}
        <header className="glass-header h-16 px-6 flex items-center gap-4 shrink-0 z-10">
          <button className="lg:hidden text-slate-500 hover:text-slate-800" onClick={() => setSidebarOpen(true)}><ChevronsRight size={22} /></button>

          <div className="flex-1 min-w-0 max-w-lg relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              placeholder="Rechercher..."
              className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-smooth"
            />
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button className="relative w-9 h-9 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-smooth">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden">
                {student?.avatar_url ? (
                  <img src={student.avatar_url} alt={`${student.first_name} ${student.last_name}`} className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-emerald-600" />
                )}
              </div>
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-xs font-bold text-slate-800">{student?.first_name} {student?.last_name}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Étudiant</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">

          {/* Welcome */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Bonjour, {student?.first_name} !
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Voici un aperçu de vos requêtes et activités.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-100 rounded-xl px-3 py-2 shrink-0 shadow-sm">
              <span className="text-emerald-500">📅</span> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {STATS.map(({ label, value, sub, icon: Icon, color, trend }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100/80 p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className={`${color} w-11 h-11 rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <p className="text-xs text-slate-500 font-semibold">{label}</p>
                <div className="flex items-end gap-1.5 mt-0.5">
                  <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
                  <span className={`text-xs font-bold ${trend === '↗' ? 'text-emerald-500' : 'text-red-400'}`}>{trend}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* MIDDLE ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

            {/* CHART */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white rounded-2xl border border-slate-100/80 shadow-sm p-4 sm:p-5 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 tracking-tight text-sm">Évolution de vos requêtes</h2>
                <select className="text-[11px] font-semibold border border-slate-100 rounded-lg px-2 py-1.5 text-slate-600 bg-white">
                  <option>Ce mois</option>
                  <option>3 mois</option>
                  <option>6 mois</option>
                </select>
              </div>

              <div className="w-full overflow-hidden">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet" style={{ height: 130 }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>
                  {[0, 2, 4, 6, 8, 10, 12].map(v => (
                    <line key={v} x1={PAD} y1={cy(v)} x2={W - PAD} y2={cy(v)} stroke="#f8fafc" strokeWidth="1" />
                  ))}
                  {[0, 2, 4, 6, 8, 10, 12].map(v => (
                    <text key={v} x={PAD - 4} y={cy(v) + 3} textAnchor="end" fontSize="9" fontWeight="500" fill="#94a3b8">{v}</text>
                  ))}
                  <path d={area} fill="url(#chartGrad)" />
                  <polyline points={polyline} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  {CHART_POINTS.filter((_, i) => i % 2 === 0 || i === 11).map((p, i) => (
                    <circle key={i} cx={cx(p.x)} cy={cy(p.y)} r="3" fill="#10b981" stroke="white" strokeWidth="1.5" />
                  ))}
                  {['01 mai', '05 mai', '10 mai', '15 mai', '19 mai'].map((label, i) => (
                    <text key={label} x={cx(i * 2.75)} y={H - 2} textAnchor="middle" fontSize="9" fontWeight="500" fill="#94a3b8">{label}</text>
                  ))}
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                {[
                  { label: 'Soumises', value: stats.total.toString(), pct: '+33%', up: true },
                  { label: 'Résolues', value: stats.resolved.toString(), pct: stats.resolved > 0 ? '+20%' : '0%', up: stats.resolved > 0 },
                  { label: 'Temps moyen', value: '4.2 j', pct: '-10%', up: false },
                ].map(({ label, value, pct, up }) => (
                  <div key={label} className="bg-slate-50/50 border border-slate-100/50 rounded-xl p-2.5">
                    <p className="text-[10px] text-slate-500 font-medium">{label}</p>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">{value}</p>
                    <p className={`text-[9px] font-bold ${up ? 'text-emerald-600' : 'text-rose-500'}`}>{up ? '↗' : '↘'} {pct}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DERNIÈRES REQUÊTES */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-4 sm:p-5 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 tracking-tight text-sm">Mes dernières requêtes</h2>
                <Link href="/mes-requetes" className="text-primary-600 text-xs font-bold hover:underline">Voir tout</Link>
              </div>
              <div className="space-y-2">
                {latestRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-500 font-medium">Aucune requête pour le moment</p>
                    <Link 
                      href="/nouvelle-requete"
                      className="inline-flex items-center gap-1 mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                    >
                      <Plus size={14} />
                      Créer une requête
                    </Link>
                  </div>
                ) : (
                  latestRequests.map((request) => {
                    const IconComponent = getCategoryIcon(request.category.icon);
                    return (
                      <Link
                        key={request.id}
                        href={`/mes-requetes/${request.reference}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100/50 cursor-pointer transition-smooth group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100/50 flex items-center justify-center shrink-0">
                          <IconComponent size={18} className="text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{request.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{formatDate(request.submitted_at)}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${getStatusColor(request.status.name)}`}>
                          {request.status.name}
                        </span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-smooth shrink-0" />
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            {/* ACTIONS RAPIDES */}
            <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-4 sm:p-5 min-w-0">
              <h2 className="font-bold text-slate-900 tracking-tight text-sm mb-4">Actions rapides</h2>
              <div className="space-y-2.5">
                {[
                  { icon: Plus, label: 'Nouvelle requête', sub: 'Soumettre une demande', bg: 'bg-emerald-50/50 border border-emerald-100/50 hover:bg-emerald-50', iconBg: 'bg-emerald-500/10 text-emerald-600', text: 'text-emerald-800', href: '/nouvelle-requete' },
                  { icon: FileText, label: 'Mes requêtes', sub: 'Voir toutes mes demandes', bg: 'bg-blue-50/50 border border-blue-100/50 hover:bg-blue-50', iconBg: 'bg-blue-500/10 text-blue-600', text: 'text-blue-800', href: '/mes-requetes' },
                  { icon: Bell, label: 'Notifications', sub: 'Consulter mes notifications', bg: 'bg-amber-50/50 border border-amber-100/50 hover:bg-amber-50', iconBg: 'bg-amber-500/10 text-amber-600', text: 'text-amber-800', badge: 3, href: '/notifications' },
                ].map(({ icon: Icon, label, sub, bg, iconBg, text, badge, href }) => (
                  <Link key={label} href={href} className={`w-full flex items-center gap-3 p-3 rounded-xl ${bg} hover:scale-[1.01] transition-smooth text-left shadow-sm shadow-slate-100/5`}>
                    <div className={`${iconBg} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-extrabold ${text}`}>{label}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{sub}</p>
                    </div>
                    {badge && <span className="bg-emerald-500/20 text-emerald-600 border border-emerald-500/25 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>}
                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* SECURITY BANNER */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50/60 border border-emerald-100/50 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Vos données sont sécurisées</p>
              <p className="text-xs text-slate-500 mt-0.5">Vos informations personnelles sont protégées et ne sont visibles que par les personnels autorisés.</p>
            </div>
            <div className="ml-auto hidden md:block opacity-25">
              <img src="https://res.cloudinary.com/dcsl6xhli/image/upload/v1781788982/images-removebg-preview_epbah4.png" alt="IUC logo" className="h-12 w-12 object-contain" />
            </div>
          </div>

        </main>
      </div>

      {/* FLOATING AI CHAT BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

        {/* Tooltip desktop chat guide */}
        {desktopChatGuide && (
          <div className="hidden lg:flex flex-col items-end gap-1 animate-fade-in">
            <div className="bg-[#0b0f19] border border-slate-800 text-white text-xs rounded-2xl px-4 py-3 max-w-[220px] text-right shadow-xl relative">
              <p className="font-semibold">Besoin d&apos;aide ? 🤖</p>
              <p className="opacity-80 mt-0.5">Cliquez ici pour discuter avec notre assistant IA.</p>
              <button
                onClick={dismissDesktopChatGuide}
                className="mt-2 text-emerald-400 font-bold text-[11px] hover:text-emerald-300"
              >
                Compris ✓
              </button>
              {/* Flèche bas */}
              <span className="absolute -bottom-2 right-5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#0b0f19]" />
            </div>
          </div>
        )}

        {/* Tooltip mobile chat guide */}
        {mobileGuide === 'chat' && (
          <div className="flex lg:hidden flex-col items-end gap-1">
            <div className="bg-[#0b0f19] border border-slate-800 text-white text-xs rounded-2xl px-4 py-3 max-w-[200px] text-right shadow-xl relative">
              <p className="font-semibold">Assistant IA 🤖</p>
              <p className="opacity-80 mt-0.5">Appuyez ici si vous avez besoin d&apos;aide.</p>
              <button
                onClick={() => dismissMobileGuide(null)}
                className="mt-2 text-emerald-400 font-bold text-[11px]"
              >
                Compris ✓
              </button>
              <span className="absolute -bottom-2 right-5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#0b0f19]" />
            </div>
          </div>
        )}

        <button className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border border-emerald-400/25">
          <MessageCircle size={24} strokeWidth={1.8} />
        </button>
      </div>

      {/* Mobile menu guide tooltip */}
      {mobileGuide === 'menu' && (
        <div className="fixed top-[72px] left-4 z-50 flex lg:hidden">
          <div className="bg-[#0b0f19] border border-slate-800 text-white text-xs rounded-2xl px-4 py-3 max-w-[210px] shadow-xl relative">
            {/* Flèche haut */}
            <span className="absolute -top-2 left-5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#0b0f19]" />
            <p className="font-semibold">Accéder au menu 📱</p>
            <p className="opacity-80 mt-0.5">Appuyez sur l&apos;icône <strong>▶</strong> en haut à gauche pour ouvrir le menu de navigation.</p>
            <button
              onClick={() => dismissMobileGuide('chat')}
              className="mt-2 text-emerald-400 font-bold text-[11px]"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
