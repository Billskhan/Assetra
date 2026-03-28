import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../platform/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const PROJECT_SELECT = {
  id: true,
  name: true,
  description: true,
  location: true,
  startDate: true,
  endDate: true,
  budget: true,
  organizationId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true
};

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(dto: CreateProjectDto) {
    const organizationId = this.parseRequiredId(dto.organizationId, 'organizationId');
    const createdById = this.parseOptionalId(dto.createdById, 'createdById');

    const data: Prisma.ProjectUncheckedCreateInput = {
      name: dto.name,
      description: dto.description,
      location: dto.location,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      budget: dto.budget,
      organizationId,
      createdById
    };

    const project = await this.prisma.project.create({
      data,
      select: PROJECT_SELECT
    });

    return this.mapProject(project);
  }

  async getProjects() {
    const projects = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      select: PROJECT_SELECT
    });

    return projects.map((project) => this.mapProject(project));
  }

  async getProjectById(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: PROJECT_SELECT
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    return this.mapProject(project);
  }

  async updateProject(id: number, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existing) {
      throw new NotFoundException('Project not found.');
    }

    const data: Prisma.ProjectUncheckedUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.startDate !== undefined)
      data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined)
      data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.budget !== undefined) data.budget = dto.budget;
    if (dto.organizationId !== undefined) {
      data.organizationId = this.parseRequiredId(dto.organizationId, 'organizationId');
    }
    if (dto.createdById !== undefined) {
      data.createdById = this.parseOptionalId(dto.createdById, 'createdById');
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No fields to update.');
    }

    const project = await this.prisma.project.update({
      where: { id },
      data,
      select: PROJECT_SELECT
    });

    return this.mapProject(project);
  }

  async deleteProject(id: number) {
    const existing = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!existing) {
      throw new NotFoundException('Project not found.');
    }

    await this.prisma.project.delete({ where: { id } });

    return { success: true };
  }

  private parseRequiredId(value: string, field: string): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`Invalid ${field}.`);
    }
    return parsed;
  }

  private parseOptionalId(value?: string, field?: string): number | undefined {
    if (value === undefined) {
      return undefined;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`Invalid ${field ?? 'id'}.`);
    }
    return parsed;
  }

  private mapProject(project: {
    id: number;
    name: string;
    description: string | null;
    location: string | null;
    startDate: Date | null;
    endDate: Date | null;
    budget: any;
    organizationId: number;
    createdById: number | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      location: project.location,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget === null ? null : Number(project.budget),
      organizationId: project.organizationId,
      createdById: project.createdById,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }
}
