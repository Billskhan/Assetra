import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ProjectRole, Role } from '@prisma/client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateProjectDto } from './dto/create-project.dto';
import { AssignProjectUserDto } from './dto/assign-project-user.dto';

const PROJECT_SELECT = {
  id: true,
  name: true,
  description: true,
  budget: true,
  organizationId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
};

type ProjectShape = {
  id: number;
  name: string;
  description: string | null;
  budget: any;
  organizationId: number;
  createdById: number | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProjectDto, user: AuthUser) {
    this.ensureCanManageProjects(user);

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: dto.name,
          description: dto.description,
          budget: dto.budget,
          organizationId: user.organizationId,
          createdById: user.userId
        },
        select: PROJECT_SELECT
      });

      await tx.projectUser.create({
        data: {
          projectId: project.id,
          userId: user.userId,
          projectRole: ProjectRole.PROJECT_MANAGER
        }
      });

      return this.mapProject(project);
    });
  }

  async findAll(user: AuthUser) {
    if (this.isAdminOrPm(user)) {
      const projects = await this.prisma.project.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: 'desc' },
        select: PROJECT_SELECT
      });

      return projects.map((project) => this.mapProject(project));
    }

    if (this.isManagerOrStakeholder(user)) {
      const projects = await this.prisma.project.findMany({
        where: {
          organizationId: user.organizationId,
          projectUsers: {
            some: { userId: user.userId }
          }
        },
        orderBy: { createdAt: 'desc' },
        select: PROJECT_SELECT
      });

      return projects.map((project) => this.mapProject(project));
    }

    throw new ForbiddenException('Project access denied');
  }

  async findOne(projectId: number, user: AuthUser) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId
      },
      include: {
        projectUsers: {
          select: { userId: true }
        },
        projectVendors: {
          include: {
            vendor: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (this.isAdminOrPm(user)) {
      const { projectUsers, projectVendors, ...projectData } = project as ProjectShape & {
        projectUsers: Array<{ userId: number }>;
        projectVendors: Array<{
          vendor: {
            id: number;
            name: string;
            email: string | null;
            phone: string | null;
            isGlobal: boolean;
            createdAt: Date;
          };
        }>;
      };
      return {
        ...this.mapProject(projectData),
        vendors: this.mapProjectVendors(projectVendors)
      };
    }

    if (this.isManagerOrStakeholder(user)) {
      const assigned = project.projectUsers.some(
        (projectUser) => projectUser.userId === user.userId
      );

      if (!assigned) {
        throw new ForbiddenException('Project access denied');
      }

      const { projectUsers, projectVendors, ...projectData } = project as ProjectShape & {
        projectUsers: Array<{ userId: number }>;
        projectVendors: Array<{
          vendor: {
            id: number;
            name: string;
            email: string | null;
            phone: string | null;
            isGlobal: boolean;
            createdAt: Date;
          };
        }>;
      };

      return {
        ...this.mapProject(projectData),
        vendors: this.mapProjectVendors(projectVendors)
      };
    }

    throw new ForbiddenException('Project access denied');
  }

  async assignUser(projectId: number, dto: AssignProjectUserDto, user: AuthUser) {
    this.ensureCanManageProjects(user);

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const targetUser = await this.prisma.user.findFirst({
      where: {
        id: dto.userId,
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.projectUser.upsert({
      where: {
        userId_projectId: {
          userId: dto.userId,
          projectId
        }
      },
      update: {
        projectRole: dto.projectRole
      },
      create: {
        userId: dto.userId,
        projectId,
        projectRole: dto.projectRole
      }
    });
  }

  private isAdminOrPm(user: AuthUser) {
    return user.role === Role.ADMIN || user.role === Role.PROJECT_MANAGER;
  }

  private isManagerOrStakeholder(user: AuthUser) {
    return user.role === Role.MANAGER || user.role === Role.STAKEHOLDER;
  }

  private ensureCanManageProjects(user: AuthUser) {
    if (!this.isAdminOrPm(user)) {
      throw new ForbiddenException('Project access denied');
    }
  }

  private mapProject(project: ProjectShape) {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      budget: project.budget === null ? null : Number(project.budget),
      organizationId: project.organizationId,
      createdById: project.createdById,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }

  private mapProjectVendors(
    links: Array<{
      vendor: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        isGlobal: boolean;
        createdAt: Date;
      };
    }>
  ) {
    return links.map((link) => link.vendor);
  }
}
