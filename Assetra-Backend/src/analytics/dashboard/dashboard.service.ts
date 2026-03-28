import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { ADMIN_ROLES, MANAGER_ROLES } from '../../common/roles';
import { ApprovalQueueResponse } from './dto/approval-queue.response';
import { ManagerDashboardResponse } from './dto/manager-dashboard.response';
import { PmDashboardResponse } from './dto/pm-dashboard.response';
import { ProjectDashboardResponse } from './dto/project-dashboard.response';
import { VendorPerformanceResponse } from './dto/vendor-performance.response';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getPmDashboard(user: AuthUser): Promise<PmDashboardResponse> {
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException('Access denied.');
    }

    const where = {
      organizationId: user.organizationId,
      status: TransactionStatus.PENDING_PM_APPROVAL
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

  async getManagerDashboard(user: AuthUser): Promise<ManagerDashboardResponse> {
    if (!MANAGER_ROLES.includes(user.role)) {
      throw new ForbiddenException('Access denied.');
    }

    let projects: Array<{ id: number; name: string; budget: any }> = [];
    let projectIds: number[] = [];

    if (ADMIN_ROLES.includes(user.role)) {
      projects = await this.prisma.project.findMany({
        where: { organizationId: user.organizationId },
        select: { id: true, name: true, budget: true }
      });
      projectIds = projects.map((project) => project.id);
    } else {
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
          status: TransactionStatus.PENDING_PM_APPROVAL
        }
      }),
      this.prisma.transaction.groupBy({
        by: ['projectId'],
        where: {
          organizationId: user.organizationId,
          projectId: { in: projectIds },
          status: { in: [TransactionStatus.APPROVED, TransactionStatus.PAID] }
        },
        _sum: { totalAmount: true }
      })
    ]);

    const spendMap = new Map<number, number>(
      spendByProject.map((row) => [row.projectId, Number(row._sum.totalAmount ?? 0)])
    );

    const projectSummaries = projects.map((project) => {
      const budget = Number(project.budget ?? 0);
      const totalSpend = spendMap.get(project.id) ?? 0;
      const budgetUsedPercent =
        budget > 0 ? Math.round((totalSpend / budget) * 10000) / 100 : 0;

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

  async getProjectDashboard(
    projectId: number,
    user: AuthUser
  ): Promise<ProjectDashboardResponse> {
    if (user.role === Role.VENDOR) {
      throw new ForbiddenException('Access denied.');
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
      throw new NotFoundException('Project not found.');
    }

    if (!ADMIN_ROLES.includes(user.role)) {
      const assigned = project.projectUsers.some(
        (projectUser) => projectUser.userId === user.userId
      );
      if (!assigned) {
        throw new ForbiddenException('Access denied.');
      }
    }

    const [stageCount, transactionCount, pendingApprovals, totalSpendAgg] =
      await Promise.all([
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
            status: TransactionStatus.PENDING_PM_APPROVAL
          }
        }),
        this.prisma.transaction.aggregate({
          where: {
            organizationId: user.organizationId,
            projectId: project.id,
            status: { in: [TransactionStatus.APPROVED, TransactionStatus.PAID] }
          },
          _sum: { totalAmount: true }
        })
      ]);

    const totalSpend = Number(totalSpendAgg._sum.totalAmount ?? 0);
    const budget = Number(project.budget ?? 0);
    const remainingBudget = budget - totalSpend;
    const budgetUsedPercent =
      budget > 0 ? Math.round((totalSpend / budget) * 10000) / 100 : 0;

    const transactionsWithContracts = await this.prisma.transaction.findMany({
      where: {
        organizationId: user.organizationId,
        projectId: project.id,
        contractId: { not: null },
        status: { in: [TransactionStatus.APPROVED, TransactionStatus.PAID] }
      },
      select: { contractId: true, totalAmount: true }
    });

    const contractIds = Array.from(
      new Set(transactionsWithContracts.map((txn) => txn.contractId).filter(Boolean))
    ) as number[];

    let topVendors: Array<{ vendorName: string; totalSpend: number }> = [];

    if (contractIds.length > 0) {
      const contracts = await this.prisma.contract.findMany({
        where: { organizationId: user.organizationId, id: { in: contractIds } },
        select: {
          id: true,
          vendor: { select: { id: true, name: true } }
        }
      });

      const contractVendorMap = new Map(
        contracts.map((contract) => [contract.id, contract.vendor])
      );

      const vendorTotals = new Map<number, { name: string; total: number }>();

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

  async getApprovalQueue(user: AuthUser): Promise<ApprovalQueueResponse[]> {
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException('Access denied.');
    }

    const approvals = await this.prisma.transaction.findMany({
      where: {
        organizationId: user.organizationId,
        status: TransactionStatus.PENDING_PM_APPROVAL
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

  async getVendorPerformance(user: AuthUser): Promise<VendorPerformanceResponse[]> {
    if (!MANAGER_ROLES.includes(user.role)) {
      throw new ForbiddenException('Access denied.');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        organizationId: user.organizationId,
        contractId: { not: null },
        status: { in: [TransactionStatus.APPROVED, TransactionStatus.PAID] }
      },
      select: { contractId: true, totalAmount: true }
    });

    const contractIds = Array.from(
      new Set(transactions.map((txn) => txn.contractId).filter(Boolean))
    ) as number[];

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

    const contractVendorMap = new Map(
      contracts.map((contract) => [contract.id, contract.vendor])
    );

    const vendorStats = new Map<
      number,
      { vendorName: string; contractIds: Set<number>; transactions: number; totalSpend: number }
    >();

    for (const txn of transactions) {
      if (!txn.contractId) {
        continue;
      }
      const vendor = contractVendorMap.get(txn.contractId);
      if (!vendor) {
        continue;
      }

      const current =
        vendorStats.get(vendor.id) ??
        {
          vendorName: vendor.name,
          contractIds: new Set<number>(),
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
}
