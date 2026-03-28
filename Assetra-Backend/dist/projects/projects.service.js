"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../platform/prisma/prisma.service");
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
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProject(dto) {
        const organizationId = this.parseRequiredId(dto.organizationId, 'organizationId');
        const createdById = this.parseOptionalId(dto.createdById, 'createdById');
        const data = {
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
    async getProjectById(id) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            select: PROJECT_SELECT
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found.');
        }
        return this.mapProject(project);
    }
    async updateProject(id, dto) {
        const existing = await this.prisma.project.findUnique({
            where: { id },
            select: { id: true }
        });
        if (!existing) {
            throw new common_1.NotFoundException('Project not found.');
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.location !== undefined)
            data.location = dto.location;
        if (dto.startDate !== undefined)
            data.startDate = dto.startDate ? new Date(dto.startDate) : null;
        if (dto.endDate !== undefined)
            data.endDate = dto.endDate ? new Date(dto.endDate) : null;
        if (dto.budget !== undefined)
            data.budget = dto.budget;
        if (dto.organizationId !== undefined) {
            data.organizationId = this.parseRequiredId(dto.organizationId, 'organizationId');
        }
        if (dto.createdById !== undefined) {
            data.createdById = this.parseOptionalId(dto.createdById, 'createdById');
        }
        if (Object.keys(data).length === 0) {
            throw new common_1.BadRequestException('No fields to update.');
        }
        const project = await this.prisma.project.update({
            where: { id },
            data,
            select: PROJECT_SELECT
        });
        return this.mapProject(project);
    }
    async deleteProject(id) {
        const existing = await this.prisma.project.findUnique({
            where: { id },
            select: { id: true }
        });
        if (!existing) {
            throw new common_1.NotFoundException('Project not found.');
        }
        await this.prisma.project.delete({ where: { id } });
        return { success: true };
    }
    parseRequiredId(value, field) {
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            throw new common_1.BadRequestException(`Invalid ${field}.`);
        }
        return parsed;
    }
    parseOptionalId(value, field) {
        if (value === undefined) {
            return undefined;
        }
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            throw new common_1.BadRequestException(`Invalid ${field ?? 'id'}.`);
        }
        return parsed;
    }
    mapProject(project) {
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
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map