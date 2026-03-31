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
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
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
                    projectRole: client_1.ProjectRole.PROJECT_MANAGER
                }
            });
            return this.mapProject(project);
        });
    }
    async findAll(user) {
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
        throw new common_1.ForbiddenException('Project access denied');
    }
    async findOne(projectId, user) {
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
            throw new common_1.NotFoundException('Project not found');
        }
        if (this.isAdminOrPm(user)) {
            const { projectUsers, projectVendors, ...projectData } = project;
            return {
                ...this.mapProject(projectData),
                vendors: this.mapProjectVendors(projectVendors)
            };
        }
        if (this.isManagerOrStakeholder(user)) {
            const assigned = project.projectUsers.some((projectUser) => projectUser.userId === user.userId);
            if (!assigned) {
                throw new common_1.ForbiddenException('Project access denied');
            }
            const { projectUsers, projectVendors, ...projectData } = project;
            return {
                ...this.mapProject(projectData),
                vendors: this.mapProjectVendors(projectVendors)
            };
        }
        throw new common_1.ForbiddenException('Project access denied');
    }
    async assignUser(projectId, dto, user) {
        this.ensureCanManageProjects(user);
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                organizationId: user.organizationId
            },
            select: { id: true }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const targetUser = await this.prisma.user.findFirst({
            where: {
                id: dto.userId,
                organizationId: user.organizationId
            },
            select: { id: true }
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found');
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
    isAdminOrPm(user) {
        return user.role === client_1.Role.ADMIN || user.role === client_1.Role.PROJECT_MANAGER;
    }
    isManagerOrStakeholder(user) {
        return user.role === client_1.Role.MANAGER || user.role === client_1.Role.STAKEHOLDER;
    }
    ensureCanManageProjects(user) {
        if (!this.isAdminOrPm(user)) {
            throw new common_1.ForbiddenException('Project access denied');
        }
    }
    mapProject(project) {
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
    mapProjectVendors(links) {
        return links.map((link) => link.vendor);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map