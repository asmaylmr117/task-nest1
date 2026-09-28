import { Role } from '../enums/role.enum.js';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}

export type SafeUser = Omit<User, 'passwordHash'>;
