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
let ContractsService = class ContractsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        const project = await this.prisma.project.findFirst({
            where: {
                id: dto.projectId,
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
        const vendor = await this.prisma.vendor.findFirst({
            where: {
                id: dto.vendorId,
                organizationId: user.organizationId
            }
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        const governance = await this.prisma.projectGovernance.findUnique({
            where: {
                projectId: dto.projectId
            }
        });
        const status = governance?.requireContractApproval
            ? client_1.ContractStatus.DRAFT
            : client_1.ContractStatus.ACTIVE;
        return this.prisma.contract.create({
            data: {
                title: dto.title,
                description: dto.description,
                totalAmount: dto.totalAmount,
                status,
                organizationId: user.organizationId,
                projectId: dto.projectId,
                vendorId: dto.vendorId
            }
        });
    }
    async findAll(user) {
        if (user.role === client_1.Role.ADMIN || user.role === client_1.Role.PROJECT_MANAGER) {
            return this.prisma.contract.findMany({
                where: {
                    organizationId: user.organizationId
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }
        return this.prisma.contract.findMany({
            where: {
                organizationId: user.organizationId,
                project: {
                    projectUsers: {
                        some: {
                            userId: user.userId
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
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
        return this.prisma.contract.findMany({
            where: {
                projectId,
                organizationId: user.organizationId
            },
            include: {
                vendor: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async approve(contractId, user) {
        if (user.role !== client_1.Role.ADMIN && user.role !== client_1.Role.PROJECT_MANAGER) {
            throw new common_1.ForbiddenException('Approval not allowed');
        }
        const contract = await this.prisma.contract.findFirst({
            where: {
                id: contractId,
                organizationId: user.organizationId
            }
        });
        if (!contract) {
            throw new common_1.NotFoundException('Contract not found');
        }
        return this.prisma.contract.update({
            where: { id: contractId },
            data: { status: client_1.ContractStatus.ACTIVE }
        });
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map