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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../platform/prisma/prisma.service");
const client_1 = require("@prisma/client");
let VendorsService = class VendorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto, user) {
        return this.prisma.vendor.create({
            data: {
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                isGlobal: dto.isGlobal,
                organizationId: user.organizationId
            }
        });
    }
    findAll(user) {
        return this.prisma.vendor.findMany({
            where: {
                organizationId: user.organizationId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async attachToProject(vendorId, projectId, user) {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                organizationId: user.organizationId
            }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const vendor = await this.prisma.vendor.findFirst({
            where: {
                id: vendorId,
                organizationId: user.organizationId
            }
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        return this.prisma.projectVendor.upsert({
            where: {
                projectId_vendorId: {
                    projectId,
                    vendorId
                }
            },
            update: {},
            create: {
                projectId,
                vendorId
            }
        });
    }
    async findByProject(projectId, user) {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                organizationId: user.organizationId
            },
            include: {
                projectUsers: { select: { userId: true } }
            }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const canAccess = user.role === client_1.Role.ADMIN ||
            user.role === client_1.Role.PROJECT_MANAGER ||
            project.projectUsers.some((pu) => pu.userId === user.userId);
        if (!canAccess) {
            throw new common_1.ForbiddenException('Project access denied');
        }
        const links = await this.prisma.projectVendor.findMany({
            where: {
                projectId
            },
            include: {
                vendor: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return links.map((link) => link.vendor);
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map