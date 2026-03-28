import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRole, Role } from '@prisma/client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { ADMIN_ROLES } from '../../common/roles';
import { CreateProjectDto } from './dto/create-project.dto';
import { AssignProjectUserDto } from './dto/assign-project-user.dto';

const PROJECT_SELECT = {
  id: true,
  organizationId: true,
  name: true,
  description: true,
  budget: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
};

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, user: AuthUser) {
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException('Not allowed to create projects.');
    }

    const project = await this.prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          organizationId: user.organizationId,
          name: dto.name,
          description: dto.description,
          budget: dto.budget,
          createdById: user.userId
        },
        select: PROJECT_SELECT
      });

      await tx.projectUser.create({
        data: {
          organizationId: user.organizationId,
          projectId: created.id,
          userId: user.userId,
          role: ProjectRole.PROJECT_MANAGER
        }
      });

      return created;
    });

    return this.mapProject(project);
  }

  async findAll(user: AuthUser) {
    if (user.role === Role.VENDOR) {
      throw new ForbiddenException('Project access denied.');
    }

    if (ADMIN_ROLES.includes(user.role)) {
      const projects = await this.prisma.project.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: 'desc' },
        select: PROJECT_SELECT
      });
      return projects.map((project) => this.mapProject(project));
    }

    const projects = await this.prisma.project.findMany({
      where: {
        organizationId: user.organizationId,
        projectUsers: { some: { userId: user.userId } }
      },
      orderBy: { createdAt: 'desc' },
      select: PROJECT_SELECT
    });

    return projects.map((project) => this.mapProject(project));
  }

  async findOne(projectId: number, user: AuthUser) {
    if (user.role === Role.VENDOR) {
      throw new ForbiddenException('Project access denied.');
    }

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: user.organizationId },
      select: {
        ...PROJECT_SELECT,
        projectUsers: {
          select: { userId: true, role: true }
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (ADMIN_ROLES.includes(user.role)) {
      return this.mapProject(project);
    }

    const assigned = project.projectUsers.some(
      (projectUser) => projectUser.userId === user.userId
    );

    if (!assigned) {
      throw new ForbiddenException('Project access denied.');
    }

    return this.mapProject(project);
  }

  async assignUser(projectId: number, dto: AssignProjectUserDto, user: AuthUser) {
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException('Not allowed to assign project users.');
    }

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: user.organizationId },
      select: { id: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const targetUser = await this.prisma.user.findFirst({
      where: { id: dto.userId, organizationId: user.organizationId },
      select: { id: true }
    });

    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }

    return this.prisma.projectUser.upsert({
      where: {
        projectId_userId: {
          projectId,
          userId: dto.userId
        }
      },
      update: {
        role: dto.projectRole
      },
      create: {
        organizationId: user.organizationId,
        projectId,
        userId: dto.userId,
        role: dto.projectRole
      },
      select: {
        projectId: true,
        userId: true,
        role: true
      }
    });
  }

  private mapProject(project: {
    id: number;
    organizationId: number;
    name: string;
    description: string | null;
    budget: any;
    createdById: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: project.id,
      organizationId: project.organizationId,
      name: project.name,
      description: project.description,
      budget: Number(project.budget ?? 0),
      createdById: project.createdById,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
