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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../platform/prisma/prisma.service");
const roles_1 = require("../../common/roles");
const VENDOR_SELECT = {
    id: true,
    name: true,
    email: true,
    phone: true,
    isGlobal: true,
    createdAt: true
};
let VendorsService = class VendorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Not allowed to create vendors.');
        }
        const name = dto.name.trim();
        const email = dto.email?.trim();
        const phone = dto.phone?.trim();
        const existing = await this.prisma.vendor.findFirst({
            where: {
                organizationId: user.organizationId,
                name: { equals: name, mode: 'insensitive' }
            },
            select: { id: true }
        });
        if (existing) {
            throw new common_1.ConflictException('Vendor name already exists.');
        }
        return this.prisma.vendor.create({
            data: {
                organizationId: user.organizationId,
                name,
                email: email && email.length > 0 ? email : null,
                phone: phone && phone.length > 0 ? phone : null,
                isGlobal: dto.isGlobal ?? false
            },
            select: VENDOR_SELECT
        });
    }
    async findAll(user, projectId) {
        if (user.role === client_1.Role.VENDOR) {
            throw new common_1.ForbiddenException('Vendor access denied.');
        }
        if (projectId !== undefined) {
            const project = await this.prisma.project.findFirst({
                where: { id: projectId, organizationId: user.organizationId },
                select: { id: true }
            });
            if (!project) {
                throw new common_1.NotFoundException('Project not found.');
            }
            return this.prisma.vendor.findMany({
                where: {
                    organizationId: user.organizationId,
                    projectVendors: { some: { projectId } }
                },
                orderBy: { createdAt: 'desc' },
                select: VENDOR_SELECT
            });
        }
        return this.prisma.vendor.findMany({
            where: { organizationId: user.organizationId },
            orderBy: { createdAt: 'desc' },
            select: VENDOR_SELECT
        });
    }
    async findOne(vendorId, user) {
        if (user.role === client_1.Role.VENDOR) {
            throw new common_1.ForbiddenException('Vendor access denied.');
        }
        const vendor = await this.prisma.vendor.findFirst({
            where: { id: vendorId, organizationId: user.organizationId },
            select: {
                ...VENDOR_SELECT,
                projectVendors: { select: { projectId: true } }
            }
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found.');
        }
        return vendor;
    }
    async attachToProject(vendorId, projectId, user) {
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Not allowed to attach vendors.');
        }
        const vendor = await this.prisma.vendor.findFirst({
            where: { id: vendorId, organizationId: user.organizationId },
            select: { id: true }
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found.');
        }
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, organizationId: user.organizationId },
            select: { id: true }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found.');
        }
        return this.prisma.projectVendor.upsert({
            where: {
                projectId_vendorId: {
                    projectId,
                    vendorId
                }
            },
            update: {
                organizationId: user.organizationId
            },
            create: {
                organizationId: user.organizationId,
                projectId,
                vendorId
            },
            select: {
                projectId: true,
                vendorId: true
            }
        });
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map