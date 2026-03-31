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
    async create(dto, user) {
        const { projectId } = dto;
        if (!projectId) {
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
        return this.prisma.$transaction(async (tx) => {
            const project = await tx.project.findFirst({
                where: {
                    id: projectId,
                    organizationId: user.organizationId
                },
                select: { id: true }
            });
            if (!project) {
                throw new common_1.NotFoundException('Project not found');
            }
            const vendor = await tx.vendor.create({
                data: {
                    name: dto.name,
                    email: dto.email,
                    phone: dto.phone,
                    isGlobal: dto.isGlobal,
                    organizationId: user.organizationId
                }
            });
            await tx.projectVendor.create({
                data: {
                    projectId,
                    vendorId: vendor.id
                }
            });
            return vendor;
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
            },
            select: {
                id: true,
                name: true,
                organizationId: true
            }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const vendor = await this.prisma.vendor.findFirst({
            where: {
                id: vendorId,
                organizationId: user.organizationId
            },
            select: {
                id: true,
                name: true,
                organizationId: true
            }
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        if (project.organizationId !== vendor.organizationId) {
            throw new common_1.ForbiddenException('Cross-organization attachment is not allowed');
        }
        const existing = await this.prisma.projectVendor.findUnique({
            where: {
                projectId_vendorId: {
                    projectId,
                    vendorId
                }
            },
            select: {
                id: true,
                createdAt: true
            }
        });
        if (existing) {
            return {
                success: true,
                alreadyAttached: true,
                attachment: existing,
                project,
                vendor
            };
        }
        try {
            const attachment = await this.prisma.projectVendor.create({
                data: {
                    projectId,
                    vendorId
                },
                select: {
                    id: true,
                    createdAt: true
                }
            });
            return {
                success: true,
                alreadyAttached: false,
                attachment,
                project,
                vendor
            };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                return {
                    success: true,
                    alreadyAttached: true,
                    project,
                    vendor
                };
            }
            throw error;
        }
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
    async getOutstandingSummary(user) {
        const vendors = await this.prisma.vendor.findMany({
            where: {
                organizationId: user.organizationId
            },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });
        const grouped = await this.prisma.transaction.groupBy({
            by: ['vendorId'],
            where: {
                organizationId: user.organizationId
            },
            _sum: {
                totalAmount: true,
                paidAmount: true,
                balance: true
            }
        });
        const byVendorId = new Map(grouped.map((row) => [
            row.vendorId,
            {
                totalTransactionAmount: Number(row._sum.totalAmount ?? 0),
                totalPaidAmount: Number(row._sum.paidAmount ?? 0),
                totalBalance: Number(row._sum.balance ?? 0)
            }
        ]));
        return vendors.map((vendor) => {
            const summary = byVendorId.get(vendor.id);
            return {
                vendorId: vendor.id,
                vendorName: vendor.name,
                totalTransactionAmount: summary?.totalTransactionAmount ?? 0,
                totalPaidAmount: summary?.totalPaidAmount ?? 0,
                totalBalance: summary?.totalBalance ?? 0
            };
        });
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map