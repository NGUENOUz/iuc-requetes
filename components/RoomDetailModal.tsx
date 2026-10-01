'use client';

import React from 'react';
import {
  X, MapPin, Users, Video, Wifi, Wind, AlertCircle,
  ArrowRight, ShieldCheck, CheckCircle2, Clock, Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: {
    id?: string;
    name: string;
    building?: string;
    capacity?: number;
    equipments?: string[];
    is_available?: boolean;
    slotInfo?: {
      day_of_week?: string;
      start_time?: string;
      end_time?: string;
      course_name?: string;
      course_code?: string;
      teacher_name?: string;
      filiere?: string;
      niveau?: string;
    };
  } | null;
}

export default function RoomDetailModal({ isOpen, onClose, room }: RoomDetailModalProps) {
  const router = useRouter();

  if (!isOpen || !room) return null;

  const handleRequestPermutation = () => {
    const courseCode = room.slotInfo?.course_code || '';
    const courseName = room.slotInfo?.course_name || '';
    const day = room.slotInfo?.day_of_week || '';
    const time = room.slotInfo ? `${room.slotInfo.start_time} - ${room.slotInfo.end_time}` : '';

    const queryParams = new URLSearchParams({
      source: 'planner_salle_popup',
      titre: `Permutation / Changement de salle pour ${room.name} (${courseCode})`,
      description: `Bonjour,\n\nJe souhaite solliciter une permutation de salle pour la séance :\n- Salle actuelle : ${room.name} (${room.building || 'Campus Universitaire'})\n- Matière : ${courseCode} - ${courseName}\n- Créneau : ${day} (${time})\n\nMotif : Besoin d'adaptation logistique (équipements ou capacité).\n\nMerci de bien vouloir vérifier la disponibilité auprès du service scolarité & logistique.`,
    });

    onClose();
    router.push(`/nouvelle-requete?${queryParams.toString()}`);
  };

  const isAmphi = room.name.toLowerCase().includes('amphi');
  const isLab = room.name.toLowerCase().includes('lab') || room.name.toLowerCase().includes('info');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl border border-orange-500/20 bg-white/95 dark:bg-[#121215]/95">
        
        {/* Header Orange Sunset Gradient */}
        <div className="p-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-start justify-between relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <span className="glass-badge bg-white/20 border-white/30 text-white px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">
              Fiche Logistique Salle
            </span>
            <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <MapPin size={22} className="text-white" />
              {room.name}
            </h3>
            <p className="text-xs text-orange-100 font-mono">
              {room.building || 'Campus Universitaire'} • Capacité : {room.capacity || 60} places assises
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
            title="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Slot Information if attached */}
          {room.slotInfo && (
            <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-500/10 border border-orange-200/70 dark:border-orange-500/20 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-orange-700 dark:text-orange-400 font-bold block">
                Séance Actuelle Programmée
              </span>
              <p className="font-extrabold text-sm text-zinc-900 dark:text-white">
                {room.slotInfo.course_code} • {room.slotInfo.course_name}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-orange-500" />
                  {room.slotInfo.day_of_week}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-orange-500" />
                  {room.slotInfo.start_time} - {room.slotInfo.end_time}
                </span>
                <span>• Enseignant : {room.slotInfo.teacher_name}</span>
              </div>
            </div>
          )}

          {/* Équipements Vérifiés */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
              Équipements & Installations Disponibles
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/5 flex items-center gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <Video size={14} />
                </div>
                <div>
                  <p className="font-bold leading-tight">Vidéoprojecteur</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{isAmphi ? 'Double écran 4K' : 'HD HDMI / Wifi'}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/5 flex items-center gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Wind size={14} />
                </div>
                <div>
                  <p className="font-bold leading-tight">Climatisation</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Fonctionnelle & régulée</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/5 flex items-center gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Wifi size={14} />
                </div>
                <div>
                  <p className="font-bold leading-tight">Wifi Campus Connect</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Fibre Haut Débit</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/5 flex items-center gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Users size={14} />
                </div>
                <div>
                  <p className="font-bold leading-tight">Effectif</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{room.capacity || 60} places numérotées</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-zinc-200/80 dark:border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Fermer
            </button>

            <button
              type="button"
              onClick={handleRequestPermutation}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <AlertCircle size={15} />
              <span>Demander une permutation</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
