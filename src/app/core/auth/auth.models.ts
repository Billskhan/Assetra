export type AuthRole =
  | 'ADMIN'
  | 'PROJECT_MANAGER'
  | 'MANAGER'
  | 'STAKEHOLDER'
  | 'VENDOR';

export interface JwtPayload {
  sub: number;
  orgId: number;
  role: AuthRole;
  email?: string;
  exp?: number;
  iat?: number;
}

export interface AuthUser {
  id: number;
  orgId: number;
  role: AuthRole;
  email?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}
