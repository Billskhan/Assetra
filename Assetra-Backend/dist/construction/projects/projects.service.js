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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../platform/prisma/prisma.service");
const roles_1 = require("../../common/roles");
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
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Not allowed to create projects.');
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
                    role: client_1.ProjectRole.PROJECT_MANAGER
                }
            });
            return created;
        });
        return this.mapProject(project);
    }
    async findAll(user) {
        if (user.role === client_1.Role.VENDOR) {
            throw new common_1.ForbiddenException('Project access denied.');
        }
        if (roles_1.ADMIN_ROLES.includes(user.role)) {
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
    async findOne(projectId, user) {
        if (user.role === client_1.Role.VENDOR) {
            throw new common_1.ForbiddenException('Project access denied.');
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
            throw new common_1.NotFoundException('Project not found.');
        }
        if (roles_1.ADMIN_ROLES.includes(user.role)) {
            return this.mapProject(project);
        }
        const assigned = project.projectUsers.some((projectUser) => projectUser.userId === user.userId);
        if (!assigned) {
            throw new common_1.ForbiddenException('Project access denied.');
        }
        return this.mapProject(project);
    }
    async assignUser(projectId, dto, user) {
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Not allowed to assign project users.');
        }
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, organizationId: user.organizationId },
            select: { id: true }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found.');
        }
        const targetUser = await this.prisma.user.findFirst({
            where: { id: dto.userId, organizationId: user.organizationId },
            select: { id: true }
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found.');
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
    mapProject(project) {
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
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map