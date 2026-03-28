import { Role } from '@prisma/client';

export interface AuthUser {
  userId: number;
  organizationId: number;
  role: Role;
  email?: string;
}
