import { User, Role, Service } from './index';

export interface UserRole extends Role {
  permissions?: string[];
}

export interface UserProfile extends Omit<User, 'role'> {
  role?: UserRole;
  service?: Service;
  niveau?: string;
  filiere?: string;
  annee_academique?: string;
  fonction?: string;
  specialite?: string;
  date_embauche?: string;
}
