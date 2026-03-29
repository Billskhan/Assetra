import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import type { AuthUser } from '../../../platform/auth/interfaces/auth-user.interface';

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      return false;
    }

    const projectId = Number(request.params.projectId);
    if (!Number.isFinite(projectId)) {
      throw new NotFoundException('Project not found');
    }

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId
      },
      include: {
        projectUsers: {
          select: { userId: true }
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (user.role === Role.ADMIN || user.role === Role.PROJECT_MANAGER) {
      return true;
    }

    if (user.role === Role.MANAGER || user.role === Role.STAKEHOLDER) {
      const assigned = project.projectUsers.some(
        (projectUser: { userId: number }) => projectUser.userId === user.userId
      );

      if (!assigned) {
        throw new ForbiddenException('Project access denied');
      }

      return true;
    }

    throw new ForbiddenException('Project access denied');
  }
}
