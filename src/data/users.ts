
import { ExtendedRole } from '@/config/permissions';

export type Role = 'admin' | 'financeiro' | 'comercial' | 'contador';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Em uma aplicação real, isso seria um hash
  role: ExtendedRole;
  status: UserStatus;
  createdAt: string; // ISO date string
  lastLogin?: string; // ISO date string
}

export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@prospera.com',
    password: 'password',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-10T10:00:00Z',
    lastLogin: '2025-06-14T15:30:00Z',
  },
  {
    id: '2',
    name: 'Finance User',
    email: 'financeiro@prospera.com',
    password: 'password',
    role: 'financeiro',
    status: 'active',
    createdAt: '2025-02-15T11:00:00Z',
    lastLogin: '2025-06-15T09:00:00Z',
  },
  {
    id: '3',
    name: 'Comercial User',
    email: 'comercial@prospera.com',
    password: 'password',
    role: 'comercial',
    status: 'inactive',
    createdAt: '2025-03-20T12:00:00Z',
  },
  {
    id: '4',
    name: 'Contador User',
    email: 'contador@prospera.com',
    password: 'password',
    role: 'contador',
    status: 'active',
    createdAt: '2025-04-05T14:00:00Z',
    lastLogin: '2025-06-13T18:00:00Z',
  },
];
