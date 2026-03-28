import { UserRole } from '../models/user-session.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface JwtPayload {
  sub: string;
  orgId: string;
  role: UserRole;
  email: string;
  exp?: number;
  iat?: number;
}
