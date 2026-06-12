'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Home, FileText, PlusCircle, Bell,
  User, FileCheck, Settings, LogOut, Search,
  Clock, CheckCircle, XCircle, TrendingUp, ChevronRight, Shield, Plus,
  ChevronsLeft, ChevronsRight, MessageCircle, LayoutGrid
} from 'lucide-react';

const STATS = [
  { label: 'Total requêtes', value: 12, sub: 'Toutes vos demandes', icon: FileText, color: 'bg-emerald-500', trend: '↗' },
  { label: 'En attente', value: 4, sub: 'En attente de traitement', icon: Clock, color: 'bg-blue-500', trend: '↗' },
  { label: 'En cours', value: 5, sub: 'En cours de traitement', icon: Clock, color: 'bg-yellow-500', trend: '↗' },
  { label: 'Résolues', value: 3, sub: 'Traitées avec succès', icon: CheckCircle, color: 'bg-emerald-600', trend: '↗' },
  { label: 'Rejetées', value: 0, sub: 'Non acceptées', icon: XCircle, color: 'bg-red-500', trend: '↘' },
];

const REQUETES = [
  { icon: GraduationCap, title: 'Réclamation de note', date: 'Soumis le 17 mai 2025', statut: 'En cours', statutColor: 'bg-yellow-100 text-yellow-700' },
  { icon: FileCheck, title: "Demande d'attestation", date: 'Soumis le 15 mai 2025', statut: 'En attente', statutColor: 'bg-blue-100 text-blue-700' },
  { icon: LayoutGrid, title: 'Changement de groupe', date: 'Soumis le 12 mai 2025', statut: 'Résolue', statutColor: 'bg-emerald-100 text-emerald-700' },
  { icon: FileText, title: 'Problème de paiement', date: 'Soumis le 08 mai 2025', statut: 'En cours', statutColor: 'bg-yellow-100 text-yellow-700' },
  { icon: Bell, title: 'Autre réclamation', date: 'Soumis le 02 mai 2025', statut: 'Résolue', statutColor: 'bg-emerald-100 text-emerald-700' },
];

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
  { label: 'Tableau de bord', icon: Home, active: true },
  { label: 'Mes requêtes', icon: FileText },
  { label: 'Nouvelle requête', icon: PlusCircle },
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

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">

      {/* SIDEBAR */}
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
          {NAV.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? 'bg-emerald-500 text-white' : 'hover:bg-white/10 text-green-100'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </button>
          ))}

          {!collapsed && <p className="text-green-300 text-[10px] uppercase tracking-widest px-3 pt-4 pb-1">Notifications</p>}
          {collapsed && <div className="my-1 border-t border-white/10" />}
          {NAV2.map(({ label, icon: Icon, badge }) => (
            <button key={label} title={collapsed ? label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 text-green-100 transition-colors ${collapsed ? 'justify-center relative' : ''}`}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
              {badge && !collapsed && <span className="ml-auto bg-emerald-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>}
              {badge && collapsed && <span className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>}
            </button>
          ))}

          {!collapsed && <p className="text-green-300 text-[10px] uppercase tracking-widest px-3 pt-4 pb-1">Mon compte</p>}
          {collapsed && <div className="my-1 border-t border-white/10" />}
          {NAV3.map(({ label, icon: Icon }) => (
            <button key={label} title={collapsed ? label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 text-green-100 transition-colors ${collapsed ? 'justify-center' : ''}`}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </button>
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

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* HEADER */}
        <header className="bg-white border-b h-16 px-6 flex items-center gap-4 shrink-0 z-10">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><ChevronsRight size={22} /></button>

          <div className="flex-1 min-w-0 max-w-lg relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              placeholder="Rechercher..."
              className="w-full h-10 bg-slate-100 rounded-xl pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button className="relative">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </button>

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

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">

          {/* Welcome */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Bonjour, Wilfried ! 👋</h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Voici un aperçu de vos requêtes et activités.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-white border rounded-xl px-3 py-2 shrink-0">
              <span className="text-emerald-600">📅</span> 19 mai 2025
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {STATS.map(({ label, value, sub, icon: Icon, color, trend }) => (
              <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className={`${color} w-11 h-11 rounded-xl text-white flex items-center justify-center mb-3`}>
                  <Icon size={22} />
                </div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <div className="flex items-end gap-1.5">
                  <p className="text-2xl font-black text-slate-900">{value}</p>
                  <span className={`text-xs font-bold mb-1 ${trend === '↗' ? 'text-emerald-500' : 'text-red-400'}`}>{trend}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* MIDDLE ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

            {/* CHART */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">Évolution de vos requêtes</h2>
                <select className="text-xs border rounded-lg px-2 py-1.5 text-slate-600 bg-white">
                  <option>Ce mois</option>
                  <option>3 mois</option>
                  <option>6 mois</option>
                </select>
              </div>

              <div className="w-full overflow-hidden">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet" style={{ height: 130 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                {[0, 2, 4, 6, 8, 10, 12].map(v => (
                  <line key={v} x1={PAD} y1={cy(v)} x2={W - PAD} y2={cy(v)} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                {[0, 2, 4, 6, 8, 10, 12].map(v => (
                  <text key={v} x={PAD - 4} y={cy(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v}</text>
                ))}
                <path d={area} fill="url(#chartGrad)" />
                <polyline points={polyline} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {CHART_POINTS.filter((_, i) => i % 2 === 0 || i === 11).map((p, i) => (
                  <circle key={i} cx={cx(p.x)} cy={cy(p.y)} r="3.5" fill="#10b981" stroke="white" strokeWidth="2" />
                ))}
                {['01 mai', '05 mai', '10 mai', '15 mai', '19 mai'].map((label, i) => (
                  <text key={label} x={cx(i * 2.75)} y={H - 2} textAnchor="middle" fontSize="10" fill="#94a3b8">{label}</text>
                ))}
              </svg>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
                {[
                  { label: 'Soumises', value: '12', pct: '+33%', up: true },
                  { label: 'Résolues', value: '3', pct: '+20%', up: true },
                  { label: 'Temps moyen', value: '4.2 jours', pct: '-10%', up: false },
                ].map(({ label, value, pct, up }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500">{label}</p>
                    <p className="font-black text-slate-900 text-sm">{value}</p>
                    <p className={`text-[10px] font-bold ${up ? 'text-emerald-500' : 'text-red-400'}`}>{up ? '↗' : '↘'} {pct}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DERNIÈRES REQUÊTES */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">Mes dernières requêtes</h2>
                <button className="text-emerald-600 text-xs font-semibold hover:underline">Voir tout</button>
              </div>
              <div className="space-y-3">
                {REQUETES.map(({ icon: Icon, title, date, statut, statutColor }) => (
                  <div key={title} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
                      <p className="text-[11px] text-slate-400">{date}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${statutColor}`}>{statut}</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS RAPIDES */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 min-w-0">
              <h2 className="font-bold text-slate-900 mb-4">Actions rapides</h2>
              <div className="space-y-3">
                {[
                  { icon: Plus, label: 'Nouvelle requête', sub: 'Soumettre une demande', bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', text: 'text-emerald-700' },
                  { icon: FileText, label: 'Mes requêtes', sub: 'Voir toutes mes demandes', bg: 'bg-blue-50', iconBg: 'bg-blue-500', text: 'text-blue-700' },
                  { icon: Bell, label: 'Notifications', sub: 'Consulter mes notifications', bg: 'bg-yellow-50', iconBg: 'bg-yellow-500', text: 'text-yellow-700', badge: 3 },

                ].map(({ icon: Icon, label, sub, bg, iconBg, text, badge }) => (
                  <button key={label} className={`w-full flex items-center gap-3 p-3 rounded-xl ${bg} hover:brightness-95 transition-all text-left`}>
                    <div className={`${iconBg} w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${text}`}>{label}</p>
                      <p className="text-[11px] text-slate-500">{sub}</p>
                    </div>
                    {badge && <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>}
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECURITY BANNER */}
          <div className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <Shield size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Vos données sont sécurisées</p>
              <p className="text-sm text-slate-500">Vos informations personnelles sont protégées et ne sont visibles que par les personnels autorisés.</p>
            </div>
            <div className="ml-auto hidden md:block opacity-30">
              <TrendingUp size={48} className="text-emerald-600" />
            </div>
          </div>

        </main>
      </div>

      {/* FLOATING AI CHAT BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

        {/* Tooltip desktop chat guide */}
        {desktopChatGuide && (
          <div className="hidden lg:flex flex-col items-end gap-1 animate-fade-in">
            <div className="bg-slate-900 text-white text-xs rounded-2xl px-4 py-3 max-w-[220px] text-right shadow-xl relative">
              <p className="font-semibold">Besoin d&apos;aide ? 🤖</p>
              <p className="opacity-80 mt-0.5">Cliquez ici pour discuter avec notre assistant IA.</p>
              <button
                onClick={dismissDesktopChatGuide}
                className="mt-2 text-emerald-400 font-bold text-[11px] hover:text-emerald-300"
              >
                Compris ✓
              </button>
              {/* Flèche bas */}
              <span className="absolute -bottom-2 right-5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900" />
            </div>
          </div>
        )}

        {/* Tooltip mobile chat guide */}
        {mobileGuide === 'chat' && (
          <div className="flex lg:hidden flex-col items-end gap-1">
            <div className="bg-slate-900 text-white text-xs rounded-2xl px-4 py-3 max-w-[200px] text-right shadow-xl relative">
              <p className="font-semibold">Assistant IA 🤖</p>
              <p className="opacity-80 mt-0.5">Appuyez ici si vous avez besoin d&apos;aide.</p>
              <button
                onClick={() => dismissMobileGuide(null)}
                className="mt-2 text-emerald-400 font-bold text-[11px]"
              >
                Compris ✓
              </button>
              <span className="absolute -bottom-2 right-5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900" />
            </div>
          </div>
        )}

        <button className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-green-500 text-white rounded-full shadow-lg shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
          <MessageCircle size={26} strokeWidth={1.8} />
        </button>
      </div>

      {/* Mobile menu guide tooltip */}
      {mobileGuide === 'menu' && (
        <div className="fixed top-[72px] left-4 z-50 flex lg:hidden">
          <div className="bg-slate-900 text-white text-xs rounded-2xl px-4 py-3 max-w-[210px] shadow-xl relative">
            {/* Flèche haut */}
            <span className="absolute -top-2 left-5 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-slate-900" />
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
