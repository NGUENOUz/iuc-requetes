'use client';

import React from 'react';
import { Users, Video, Wifi, Wind, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import CampusMiniMap from '@/components/ui/CampusMiniMap';

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

  if (!room) return null;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fiche de la salle ${room.name}`}
      description={`${room.building || 'Campus principal'} • Capacité : ${room.capacity || 60} places assises`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRequestPermutation}>
            Demander une permutation
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* CARTE 3D DU CAMPUS & GUIDAGE GPS */}
        <CampusMiniMap
          roomName={room.name}
          buildingName={room.building || 'Bâtiment Principal Pôle A'}
          floor="1er Étage • Aile Ouest"
        />

        {/* Séance programmée */}
        {room.slotInfo && (
          <div className="p-4 rounded-lg bg-accent-soft border border-accent/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-accent-text">
                Cours programmé sur ce créneau
              </span>
              <StatusBadge variant="info">
                {room.slotInfo.day_of_week} {room.slotInfo.start_time} - {room.slotInfo.end_time}
              </StatusBadge>
            </div>
            <p className="font-semibold text-sm text-fg">
              {room.slotInfo.course_code ? `${room.slotInfo.course_code} • ` : ''}
              {room.slotInfo.course_name}
            </p>
            <p className="text-xs text-fg-secondary">
              {room.slotInfo.filiere} {room.slotInfo.niveau ? `(${room.slotInfo.niveau})` : ''} • Enseignant : {room.slotInfo.teacher_name}
            </p>
          </div>
        )}

        {/* Équipements de la salle */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-fg uppercase tracking-wider">
            Équipements et logistique disponibles
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-md bg-surface-muted border border-line flex items-center gap-2 text-fg">
              <Users size={16} className="text-fg-muted" />
              <span>{room.capacity || 60} places assises</span>
            </div>
            <div className="p-3 rounded-md bg-surface-muted border border-line flex items-center gap-2 text-fg">
              <Video size={16} className="text-fg-muted" />
              <span>Vidéoprojecteur HDMI</span>
            </div>
            <div className="p-3 rounded-md bg-surface-muted border border-line flex items-center gap-2 text-fg">
              <Wifi size={16} className="text-fg-muted" />
              <span>Couverture Wi-Fi campus</span>
            </div>
            <div className="p-3 rounded-md bg-surface-muted border border-line flex items-center gap-2 text-fg">
              <Wind size={16} className="text-fg-muted" />
              <span>Climatisation fonctionnelle</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
