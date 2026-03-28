export type UserRole = 'PROJECT_MANAGER' | 'MANAGER' | 'ADMIN' | string;

export interface UserSession {
  sub: string;
  orgId: string;
  role: UserRole;
  email: string;
}
