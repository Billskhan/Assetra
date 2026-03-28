import { AuthRole, AuthUser, JwtPayload } from './auth.models';

const allowedRoles: AuthRole[] = [
  'ADMIN',
  'PROJECT_MANAGER',
  'MANAGER',
  'STAKEHOLDER',
  'VENDOR'
];

export function decodeJwtPayload<T>(token: string): T | null {
  if (!token || typeof atob !== 'function') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = parts[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '='
    );
    const json = atob(padded);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function mapJwtToUser(payload: JwtPayload | null): AuthUser | null {
  if (!payload) {
    return null;
  }

  const id = Number(payload.sub);
  const orgId = Number(payload.orgId);
  const role = payload.role;

  if (!Number.isFinite(id) || !Number.isFinite(orgId)) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    return null;
  }

  const email = typeof payload.email === 'string' ? payload.email : undefined;

  return {
    id,
    orgId,
    role,
    email
  };
}
