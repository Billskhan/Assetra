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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../platform/prisma/prisma.service");
const roles_1 = require("../../common/roles");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPmDashboard(user) {
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Access denied.');
        }
        const where = {
            organizationId: user.organizationId,
            status: client_1.TransactionStatus.PENDING_PM_APPROVAL
        };
        const [aggregate, recent] = await Promise.all([
            this.prisma.transaction.aggregate({
                where,
                _count: { id: true },
                _sum: { totalAmount: true }
            }),
            this.prisma.transaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    totalAmount: true,
                    createdAt: true,
                    project: { select: { name: true } }
                }
            })
        ]);
        return {
            pendingTransactions: aggregate._count.id,
            pendingAmount: Number(aggregate._sum.totalAmount ?? 0),
            recentPendingTransactions: recent.map((transaction) => ({
                id: transaction.id,
                title: transaction.title,
                amount: Number(transaction.totalAmount),
                createdAt: transaction.createdAt,
                projectName: transaction.project.name
            }))
        };
    }
    async getManagerDashboard(user) {
        if (!roles_1.MANAGER_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Access denied.');
        }
        let projects = [];
        let projectIds = [];
        if (roles_1.ADMIN_ROLES.includes(user.role)) {
            projects = await this.prisma.project.findMany({
                where: { organizationId: user.organizationId },
                select: { id: true, name: true, budget: true }
            });
            projectIds = projects.map((project) => project.id);
        }
        else {
            const assignments = await this.prisma.projectUser.findMany({
                where: { organizationId: user.organizationId, userId: user.userId },
                select: { projectId: true }
            });
            projectIds = assignments.map((assignment) => assignment.projectId);
            if (projectIds.length > 0) {
                projects = await this.prisma.project.findMany({
                    where: { organizationId: user.organizationId, id: { in: projectIds } },
                    select: { id: true, name: true, budget: true }
                });
            }
        }
        if (projectIds.length === 0) {
            return {
                assignedProjects: 0,
                pendingApprovalCount: 0,
                projectSummaries: []
            };
        }
        const [pendingApprovalCount, spendByProject] = await Promise.all([
            this.prisma.transaction.count({
                where: {
                    organizationId: user.organizationId,
                    projectId: { in: projectIds },
                    status: client_1.TransactionStatus.PENDING_PM_APPROVAL
                }
            }),
            this.prisma.transaction.groupBy({
                by: ['projectId'],
                where: {
                    organizationId: user.organizationId,
                    projectId: { in: projectIds },
                    status: { in: [client_1.TransactionStatus.APPROVED, client_1.TransactionStatus.PAID] }
                },
                _sum: { totalAmount: true }
            })
        ]);
        const spendMap = new Map(spendByProject.map((row) => [row.projectId, Number(row._sum.totalAmount ?? 0)]));
        const projectSummaries = projects.map((project) => {
            const budget = Number(project.budget ?? 0);
            const totalSpend = spendMap.get(project.id) ?? 0;
            const budgetUsedPercent = budget > 0 ? Math.round((totalSpend / budget) * 10000) / 100 : 0;
            return {
                projectId: project.id,
                projectName: project.name,
                budget,
                totalSpend,
                budgetUsedPercent
            };
        });
        return {
            assignedProjects: projects.length,
            pendingApprovalCount,
            projectSummaries
        };
    }
    async getProjectDashboard(projectId, user) {
        if (user.role === client_1.Role.VENDOR) {
            throw new common_1.ForbiddenException('Access denied.');
        }
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, organizationId: user.organizationId },
            select: {
                id: true,
                name: true,
                budget: true,
                projectUsers: { select: { userId: true } }
            }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found.');
        }
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            const assigned = project.projectUsers.some((projectUser) => projectUser.userId === user.userId);
            if (!assigned) {
                throw new common_1.ForbiddenException('Access denied.');
            }
        }
        const [stageCount, transactionCount, pendingApprovals, totalSpendAgg] = await Promise.all([
            this.prisma.stage.count({
                where: { organizationId: user.organizationId, projectId: project.id }
            }),
            this.prisma.transaction.count({
                where: { organizationId: user.organizationId, projectId: project.id }
            }),
            this.prisma.transaction.count({
                where: {
                    organizationId: user.organizationId,
                    projectId: project.id,
                    status: client_1.TransactionStatus.PENDING_PM_APPROVAL
                }
            }),
            this.prisma.transaction.aggregate({
                where: {
                    organizationId: user.organizationId,
                    projectId: project.id,
                    status: { in: [client_1.TransactionStatus.APPROVED, client_1.TransactionStatus.PAID] }
                },
                _sum: { totalAmount: true }
            })
        ]);
        const totalSpend = Number(totalSpendAgg._sum.totalAmount ?? 0);
        const budget = Number(project.budget ?? 0);
        const remainingBudget = budget - totalSpend;
        const budgetUsedPercent = budget > 0 ? Math.round((totalSpend / budget) * 10000) / 100 : 0;
        const transactionsWithContracts = await this.prisma.transaction.findMany({
            where: {
                organizationId: user.organizationId,
                projectId: project.id,
                contractId: { not: null },
                status: { in: [client_1.TransactionStatus.APPROVED, client_1.TransactionStatus.PAID] }
            },
            select: { contractId: true, totalAmount: true }
        });
        const contractIds = Array.from(new Set(transactionsWithContracts.map((txn) => txn.contractId).filter(Boolean)));
        let topVendors = [];
        if (contractIds.length > 0) {
            const contracts = await this.prisma.contract.findMany({
                where: { organizationId: user.organizationId, id: { in: contractIds } },
                select: {
                    id: true,
                    vendor: { select: { id: true, name: true } }
                }
            });
            const contractVendorMap = new Map(contracts.map((contract) => [contract.id, contract.vendor]));
            const vendorTotals = new Map();
            for (const txn of transactionsWithContracts) {
                if (!txn.contractId) {
                    continue;
                }
                const vendor = contractVendorMap.get(txn.contractId);
                if (!vendor) {
                    continue;
                }
                const current = vendorTotals.get(vendor.id) ?? {
                    name: vendor.name,
                    total: 0
                };
                current.total += Number(txn.totalAmount);
                vendorTotals.set(vendor.id, current);
            }
            topVendors = Array.from(vendorTotals.values())
                .map((vendor) => ({
                vendorName: vendor.name,
                totalSpend: vendor.total
            }))
                .sort((a, b) => b.totalSpend - a.totalSpend);
        }
        return {
            project: {
                id: project.id,
                name: project.name,
                budget
            },
            financial: {
                budget,
                totalSpend,
                remainingBudget,
                budgetUsedPercent
            },
            execution: {
                stageCount,
                transactionCount,
                pendingApprovals
            },
            topVendors
        };
    }
    async getApprovalQueue(user) {
        if (!roles_1.ADMIN_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Access denied.');
        }
        const approvals = await this.prisma.transaction.findMany({
            where: {
                organizationId: user.organizationId,
                status: client_1.TransactionStatus.PENDING_PM_APPROVAL
            },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                title: true,
                totalAmount: true,
                createdAt: true,
                project: { select: { name: true } },
                contract: {
                    select: {
                        vendor: { select: { name: true } }
                    }
                }
            }
        });
        return approvals.map((transaction) => ({
            id: transaction.id,
            title: transaction.title,
            amount: Number(transaction.totalAmount),
            createdAt: transaction.createdAt,
            projectName: transaction.project.name,
            vendorName: transaction.contract?.vendor?.name ?? 'No Vendor'
        }));
    }
    async getVendorPerformance(user) {
        if (!roles_1.MANAGER_ROLES.includes(user.role)) {
            throw new common_1.ForbiddenException('Access denied.');
        }
        const transactions = await this.prisma.transaction.findMany({
            where: {
                organizationId: user.organizationId,
                contractId: { not: null },
                status: { in: [client_1.TransactionStatus.APPROVED, client_1.TransactionStatus.PAID] }
            },
            select: { contractId: true, totalAmount: true }
        });
        const contractIds = Array.from(new Set(transactions.map((txn) => txn.contractId).filter(Boolean)));
        if (contractIds.length === 0) {
            return [];
        }
        const contracts = await this.prisma.contract.findMany({
            where: { organizationId: user.organizationId, id: { in: contractIds } },
            select: {
                id: true,
                vendor: { select: { id: true, name: true } }
            }
        });
        const contractVendorMap = new Map(contracts.map((contract) => [contract.id, contract.vendor]));
        const vendorStats = new Map();
        for (const txn of transactions) {
            if (!txn.contractId) {
                continue;
            }
            const vendor = contractVendorMap.get(txn.contractId);
            if (!vendor) {
                continue;
            }
            const current = vendorStats.get(vendor.id) ??
                {
                    vendorName: vendor.name,
                    contractIds: new Set(),
                    transactions: 0,
                    totalSpend: 0
                };
            current.contractIds.add(txn.contractId);
            current.transactions += 1;
            current.totalSpend += Number(txn.totalAmount);
            vendorStats.set(vendor.id, current);
        }
        return Array.from(vendorStats.entries())
            .map(([vendorId, stats]) => ({
            vendorId,
            vendorName: stats.vendorName,
            contracts: stats.contractIds.size,
            transactions: stats.transactions,
            totalSpend: stats.totalSpend
        }))
            .sort((a, b) => b.totalSpend - a.totalSpend);
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map