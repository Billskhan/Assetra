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
const TRANSACTION_SELECT = {
    id: true,
    organizationId: true,
    projectId: true,
    vendorId: true,
    date: true,
    stageName: true,
    entryType: true,
    category: true,
    subCategory: true,
    item: true,
    receiptNo: true,
    quantity: true,
    unit: true,
    rate: true,
    carriage: true,
    length: true,
    paymentMode: true,
    totalAmount: true,
    paidAmount: true,
    balance: true,
    comments: true,
    createdById: true,
    createdAt: true,
    updatedAt: true
};
const STAGE_SELECT = {
    id: true,
    name: true,
    projectId: true,
    createdAt: true
};
let TransactionsService = class TransactionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, user, routeProjectId) {
        const projectId = this.resolveProjectId(dto.projectId, routeProjectId);
        const project = await this.getAccessibleProject(projectId, user);
        const vendor = await this.prisma.vendor.findFirst({
            where: {
                id: dto.vendorId,
                organizationId: user.organizationId
            },
            select: {
                id: true
            }
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        const projectVendor = await this.prisma.projectVendor.findUnique({
            where: {
                projectId_vendorId: {
                    projectId: project.id,
                    vendorId: vendor.id
                }
            },
            select: {
                id: true
            }
        });
        if (!projectVendor) {
            throw new common_1.BadRequestException('Vendor is not attached to the selected project');
        }
        const { totalAmount, paidAmount, balance } = this.normalizeAmounts(dto);
        const created = await this.prisma.transaction.create({
            data: {
                organizationId: user.organizationId,
                projectId: project.id,
                vendorId: vendor.id,
                date: new Date(dto.date),
                stageName: this.normalizeOptionalString(dto.stageName),
                entryType: dto.entryType,
                category: this.normalizeRequiredString(dto.category, 'category'),
                subCategory: this.normalizeRequiredString(dto.subCategory, 'subCategory'),
                item: this.normalizeRequiredString(dto.item, 'item'),
                receiptNo: this.normalizeOptionalString(dto.receiptNo),
                quantity: this.toNullableNumber(dto.quantity),
                unit: this.normalizeOptionalString(dto.unit),
                rate: this.toNullableNumber(dto.rate),
                carriage: this.toNullableNumber(dto.carriage),
                length: this.normalizeOptionalString(dto.length),
                paymentMode: dto.paymentMode,
                totalAmount,
                paidAmount,
                balance,
                comments: this.normalizeOptionalString(dto.comments),
                createdById: user.userId
            },
            select: TRANSACTION_SELECT
        });
        return this.mapTransaction(created);
    }
    async findAll(user) {
        const where = user.role === client_1.Role.ADMIN || user.role === client_1.Role.PROJECT_MANAGER
            ? {
                organizationId: user.organizationId
            }
            : {
                organizationId: user.organizationId,
                project: {
                    projectUsers: {
                        some: {
                            userId: user.userId
                        }
                    }
                }
            };
        const transactions = await this.prisma.transaction.findMany({
            where,
            select: TRANSACTION_SELECT,
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
        });
        return transactions.map((transaction) => this.mapTransaction(transaction));
    }
    async findByProject(projectId, user) {
        await this.getAccessibleProject(projectId, user);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                organizationId: user.organizationId,
                projectId
            },
            select: TRANSACTION_SELECT,
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
        });
        return transactions.map((transaction) => this.mapTransaction(transaction));
    }
    async findStagesByProject(projectId, user) {
        await this.getAccessibleProject(projectId, user);
        const stages = await this.prisma.projectStage.findMany({
            where: {
                organizationId: user.organizationId,
                projectId
            },
            select: STAGE_SELECT,
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
        });
        return stages.map((stage) => this.mapStage(stage));
    }
    async getAccessibleProject(projectId, user) {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                organizationId: user.organizationId
            },
            select: {
                id: true,
                projectUsers: {
                    select: {
                        userId: true
                    }
                }
            }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const canAccess = user.role === client_1.Role.ADMIN ||
            user.role === client_1.Role.PROJECT_MANAGER ||
            project.projectUsers.some((projectUser) => projectUser.userId === user.userId);
        if (!canAccess) {
            throw new common_1.ForbiddenException('Project access denied');
        }
        return project;
    }
    normalizeAmounts(dto) {
        const totalAmount = this.toNonNegativeNumber(dto.totalAmount, 'totalAmount', true);
        const hasPaidAmount = dto.paidAmount !== undefined && dto.paidAmount !== null;
        const hasBalance = dto.balance !== undefined && dto.balance !== null;
        if (!hasPaidAmount && !hasBalance) {
            throw new common_1.BadRequestException('Either paidAmount or balance is required');
        }
        const paidAmountInput = hasPaidAmount
            ? this.toNonNegativeNumber(dto.paidAmount, 'paidAmount')
            : undefined;
        const balanceInput = hasBalance
            ? this.toNonNegativeNumber(dto.balance, 'balance')
            : undefined;
        let paidAmount = paidAmountInput;
        let balance = balanceInput;
        if (paidAmount === undefined && balance !== undefined) {
            paidAmount = totalAmount - balance;
        }
        if (balance === undefined && paidAmount !== undefined) {
            balance = totalAmount - paidAmount;
        }
        if (paidAmount === undefined || balance === undefined) {
            throw new common_1.BadRequestException('Unable to normalize paidAmount and balance');
        }
        if (paidAmount < 0) {
            throw new common_1.BadRequestException('paidAmount cannot be less than 0');
        }
        if (balance < 0) {
            throw new common_1.BadRequestException('balance cannot be less than 0');
        }
        if (paidAmount > totalAmount) {
            throw new common_1.BadRequestException('paidAmount cannot be greater than totalAmount');
        }
        if (balance > totalAmount) {
            throw new common_1.BadRequestException('balance cannot be greater than totalAmount');
        }
        if (hasPaidAmount && hasBalance) {
            const expectedBalance = totalAmount - paidAmount;
            if (Math.abs(expectedBalance - balance) > 0.000001) {
                throw new common_1.BadRequestException('paidAmount and balance are inconsistent with totalAmount');
            }
        }
        return {
            totalAmount,
            paidAmount,
            balance
        };
    }
    resolveProjectId(bodyProjectId, routeProjectId) {
        if (bodyProjectId !== undefined &&
            routeProjectId !== undefined &&
            bodyProjectId !== routeProjectId) {
            throw new common_1.BadRequestException('Project ID in body does not match route project ID');
        }
        const projectId = routeProjectId ?? bodyProjectId;
        if (!projectId || !Number.isInteger(projectId) || projectId <= 0) {
            throw new common_1.BadRequestException('Project ID is required');
        }
        return projectId;
    }
    normalizeOptionalString(value) {
        const trimmed = value?.trim();
        return trimmed ? trimmed : undefined;
    }
    normalizeRequiredString(value, fieldName) {
        const trimmed = value?.trim();
        if (!trimmed) {
            throw new common_1.BadRequestException(`${fieldName} is required`);
        }
        return trimmed;
    }
    toNonNegativeNumber(value, fieldName, required = false) {
        if (value === undefined || value === null) {
            if (!required) {
                return 0;
            }
            throw new common_1.BadRequestException(`${fieldName} is required`);
        }
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            throw new common_1.BadRequestException(`${fieldName} must be a valid number`);
        }
        if (parsed < 0) {
            throw new common_1.BadRequestException(`${fieldName} cannot be less than 0`);
        }
        return parsed;
    }
    toNullableNumber(value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        return Number(value);
    }
    mapTransaction(transaction) {
        return {
            id: transaction.id,
            organizationId: transaction.organizationId,
            projectId: transaction.projectId,
            vendorId: transaction.vendorId,
            date: transaction.date,
            stageName: transaction.stageName,
            entryType: transaction.entryType,
            category: transaction.category,
            subCategory: transaction.subCategory,
            item: transaction.item,
            receiptNo: transaction.receiptNo,
            quantity: transaction.quantity === null ? null : Number(transaction.quantity),
            unit: transaction.unit,
            rate: transaction.rate === null ? null : Number(transaction.rate),
            carriage: transaction.carriage === null ? null : Number(transaction.carriage),
            length: transaction.length,
            paymentMode: transaction.paymentMode,
            totalAmount: Number(transaction.totalAmount),
            paidAmount: Number(transaction.paidAmount),
            balance: Number(transaction.balance),
            comments: transaction.comments,
            createdBy: transaction.createdById,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        };
    }
    mapStage(stage) {
        return {
            id: stage.id,
            name: stage.name,
            projectId: stage.projectId,
            createdAt: stage.createdAt
        };
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map