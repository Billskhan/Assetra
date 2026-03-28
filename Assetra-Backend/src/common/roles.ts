import { Role } from '@prisma/client';

export const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.PROJECT_MANAGER];
export const MANAGER_ROLES: Role[] = [
  Role.ADMIN,
  Role.PROJECT_MANAGER,
  Role.MANAGER
];
