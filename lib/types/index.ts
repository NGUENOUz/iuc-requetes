export interface User {
  id: string;
  auth_user_id: string;
  matricule: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_id: string;
  service_id?: string;
  is_active: boolean;
  must_set_password: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  role?: Role;
  service?: Service;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
}

export interface Request {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category_id: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  cycle: string;
  filiere: string;
  niveau: string;
  semester: string;
  academic_year: string;
  teacher_id: string;
  teacher_name: string;
  teacher_title?: string;
  teacher_email?: string;
  teacher_office?: string;
}

export interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  academic_year: string;
  cycle: string;
  semester: string;
  cc: number | null;
  sn: number | null;
  rattrapage?: number | null;
  moyenne: number | null;
  status: 'valide' | 'rattrapage' | 'non_valide' | 'en_attente';
  credits_obtenus: number;
  appreciation?: string;
  updated_at: string;
  course?: Course;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  building: string;
  capacity: number;
  type: string;
  equipments: string[];
  is_available: boolean;
}

export interface TimetableSlot {
  id: string;
  day_of_week: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  start_time: string;
  end_time: string;
  course_id: string;
  course_code: string;
  course_name: string;
  filiere: string;
  niveau: string;
  teacher_id: string;
  teacher_name: string;
  room_id: string;
  room_name: string;
  room_building: string;
  room_capacity: number;
  room_equipments: string[];
  session_type: string;
  status: 'programme' | 'en_cours' | 'termine' | 'reporte';
  is_active: boolean;
  course?: Course;
  room?: Room;
}

