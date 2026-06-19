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
