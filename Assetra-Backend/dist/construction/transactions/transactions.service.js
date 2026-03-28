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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../platform/prisma/prisma.service");
const roles_1 = require("../../common/roles");
const TRANSACTION_SELECT = {
    id: true,
    title: true,
    totalAmount: true,
    status: true,
    createdAt: true,
    contractId: true,
    project: { select: { id: true, name: true } }
};
let TransactionsService = class TransactionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user) {
        if (!roles_1.MANAGER_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Not allowed to create transactions.');
        }
        const project = await this.getProjectForAccess(dto.projectId, user);
        if (dto.contractId) {
            const contract = await this.prisma.contract.findFirst({
                where: {
                    id: dto.contractId,
                    organizationId: user.organizationId,
                    projectId: project.id
                },
                select: { id: true }
            });
            if (!contract) {
                throw new common_1.NotFoundException('Contract not found for this project.');
            }
        }
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('Transaction items are required.');
        }
        const governance = await this.prisma.projectGovernance.findUnique({
            where: { projectId: project.id },
            select: { approvalRequired: true }
        });
        const requiresApproval = governance?.approvalRequired ?? false;
        const status = requiresApproval
            ? client_1.TransactionStatus.PENDING_PM_APPROVAL
            : client_1.TransactionStatus.APPROVED;
        const items = dto.items.map((item) => {
            const total = item.quantity * item.unitPrice;
            return {
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total
            };
        });
        const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
        const transaction = await this.prisma.transaction.create({
            data: {
                organizationId: user.organizationId,
                title: dto.title,
                projectId: project.id,
                contractId: dto.contractId ?? null,
                status,
                totalAmount,
                createdById: user.userId,
                items: { create: items }
            },
            select: { id: true }
        });
        return { id: transaction.id };
    }
    async findAll(user) {
        if (user.role === client_1.Role.VENDOR) {
            throw new common_1.ForbiddenException('Transaction access denied.');
        }
        const where = {
            organizationId: user.organizationId
        };
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            where.project = {
                projectUsers: { some: { userId: user.userId } }
            };
        }
        const transactions = await this.prisma.transaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: TRANSACTION_SELECT
        });
        return transactions.map((transaction) => ({
            ...transaction,
            totalAmount: Number(transaction.totalAmount)
        }));
    }
    async findByProject(projectId, user) {
        if (user.role === client_1.Role.VENDOR) {
            throw new common_1.ForbiddenException('Transaction access denied.');
        }
        await this.getProjectForAccess(projectId, user);
        const transactions = await this.prisma.transaction.findMany({
            where: { organizationId: user.organizationId, projectId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                totalAmount: true,
                status: true,
                createdAt: true,
                items: {
                    select: { id: true, name: true, quantity: true, unitPrice: true, total: true }
                }
            }
        });
        return transactions.map((transaction) => ({
            ...transaction,
            totalAmount: Number(transaction.totalAmount),
            items: transaction.items.map((item) => ({
                ...item,
                unitPrice: Number(item.unitPrice),
                total: Number(item.total)
            }))
        }));
    }
    async approve(transactionId, user) {
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Not allowed to approve transactions.');
        }
        const transaction = await this.prisma.transaction.findFirst({
            where: { id: transactionId, organizationId: user.organizationId },
            select: { id: true, status: true }
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found.');
        }
        if (transaction.status !== client_1.TransactionStatus.PENDING_PM_APPROVAL) {
            throw new common_1.BadRequestException('Transaction is not pending approval.');
        }
        const updated = await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: client_1.TransactionStatus.APPROVED },
            select: TRANSACTION_SELECT
        });
        return { ...updated, totalAmount: Number(updated.totalAmount) };
    }
    async reject(transactionId, user) {
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Not allowed to reject transactions.');
        }
        const transaction = await this.prisma.transaction.findFirst({
            where: { id: transactionId, organizationId: user.organizationId },
            select: { id: true, status: true }
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found.');
        }
        if (transaction.status !== client_1.TransactionStatus.PENDING_PM_APPROVAL) {
            throw new common_1.BadRequestException('Transaction is not pending approval.');
        }
        const updated = await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: client_1.TransactionStatus.REJECTED },
            select: TRANSACTION_SELECT
        });
        return { ...updated, totalAmount: Number(updated.totalAmount) };
    }
    async getProjectForAccess(projectId, user) {
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, organizationId: user.organizationId },
            select: {
                id: true,
                name: true,
                projectUsers: { select: { userId: true } }
            }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found.');
        }
        if (roles_1.ADMIN_ROLES.includes(user.role)) {
            return project;
        }
        const assigned = project.projectUsers.some((projectUser) => projectUser.userId === user.userId);
        if (!assigned) {
            throw new common_1.ForbiddenException('Project access denied.');
        }
        return project;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map