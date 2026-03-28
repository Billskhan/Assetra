import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { AuthUser } from '../../../platform/auth/interfaces/auth-user.interface';
import { ADMIN_ROLES } from '../../../common/roles';

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;
    const projectId = Number(request.params?.projectId);

    if (!user || !Number.isInteger(projectId)) {
      throw new NotFoundException('Project not found.');
    }

    if (user.role === Role.VENDOR) {
      throw new ForbiddenException('Project access denied.');
    }

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: user.organizationId }
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (ADMIN_ROLES.includes(user.role)) {
      return true;
    }

    const assignment = await this.prisma.projectUser.findFirst({
      where: { projectId, userId: user.userId, organizationId: user.organizationId }
    });

    if (!assignment) {
      throw new ForbiddenException('Project access denied.');
    }

    return true;
  }
}
