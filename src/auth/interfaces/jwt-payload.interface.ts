import { Role } from '../enums/role.enum.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface ActiveUserData {
  userId: string;
  email: string;
  role: Role;
}
