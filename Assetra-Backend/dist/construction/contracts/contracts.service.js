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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../platform/prisma/prisma.service");
const roles_1 = require("../../common/roles");
const CONTRACT_SELECT = {
    id: true,
    title: true,
    description: true,
    totalAmount: true,
    status: true,
    createdAt: true,
    project: { select: { id: true, name: true } },
    vendor: { select: { id: true, name: true } }
};
let ContractsService = class ContractsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Not allowed to create contracts.');
        }
        const project = await this.prisma.project.findFirst({
            where: { id: dto.projectId, organizationId: user.organizationId },
            select: { id: true }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found.');
        }
        const vendor = await this.prisma.vendor.findFirst({
            where: { id: dto.vendorId, organizationId: user.organizationId },
            select: { id: true }
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found.');
        }
        const contract = await this.prisma.contract.create({
            data: {
                organizationId: user.organizationId,
                title: dto.title,
                description: dto.description,
                totalAmount: dto.totalAmount,
                status: client_1.ContractStatus.DRAFT,
                projectId: project.id,
                vendorId: vendor.id
            },
            select: { id: true }
        });
        return { id: contract.id };
    }
    async findAll(user) {
        if (user.role === client_1.Role.VENDOR) {
            throw new common_1.ForbiddenException('Contract access denied.');
        }
        const where = {
            organizationId: user.organizationId
        };
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            where.project = {
                projectUsers: { some: { userId: user.userId } }
            };
        }
        const contracts = await this.prisma.contract.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: CONTRACT_SELECT
        });
        return contracts.map((contract) => ({
            ...contract,
            totalAmount: Number(contract.totalAmount)
        }));
    }
    async findOne(contractId, user) {
        if (user.role === client_1.Role.VENDOR) {
            throw new common_1.ForbiddenException('Contract access denied.');
        }
        const contract = await this.prisma.contract.findFirst({
            where: { id: contractId, organizationId: user.organizationId },
            select: {
                ...CONTRACT_SELECT,
                project: {
                    select: {
                        id: true,
                        name: true,
                        projectUsers: { select: { userId: true } }
                    }
                }
            }
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contract not found.');
        }
        if (roles_1.ADMIN_ROLES.includes(user.role)) {
            return {
                ...contract,
                project: { id: contract.project.id, name: contract.project.name },
                totalAmount: Number(contract.totalAmount)
            };
        }
        const assigned = contract.project.projectUsers.some((projectUser) => projectUser.userId === user.userId);
        if (!assigned) {
            throw new common_1.ForbiddenException('Contract access denied.');
        }
        return {
            ...contract,
            project: { id: contract.project.id, name: contract.project.name },
            totalAmount: Number(contract.totalAmount)
        };
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map