import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Role, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { ADMIN_ROLES, MANAGER_ROLES } from '../../common/roles';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const TRANSACTION_SELECT = {
  id: true,
  title: true,
  totalAmount: true,
  status: true,
  createdAt: true,
  contractId: true,
  project: { select: { id: true, name: true } }
};

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, user: AuthUser) {
    if (!MANAGER_ROLES.includes(user.role)) {
      throw new ForbiddenException('Not allowed to create transactions.');
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
        throw new NotFoundException('Contract not found for this project.');
      }
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Transaction items are required.');
    }

    const governance = await this.prisma.projectGovernance.findUnique({
      where: { projectId: project.id },
      select: { approvalRequired: true }
    });

    const requiresApproval = governance?.approvalRequired ?? false;
    const status = requiresApproval
      ? TransactionStatus.PENDING_PM_APPROVAL
      : TransactionStatus.APPROVED;

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

  async findAll(user: AuthUser) {
    if (user.role === Role.VENDOR) {
      throw new ForbiddenException('Transaction access denied.');
    }

    const where: Record<string, unknown> = {
      organizationId: user.organizationId
    };

    if (!ADMIN_ROLES.includes(user.role)) {
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

  async findByProject(projectId: number, user: AuthUser) {
    if (user.role === Role.VENDOR) {
      throw new ForbiddenException('Transaction access denied.');
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

  async approve(transactionId: number, user: AuthUser) {
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException('Not allowed to approve transactions.');
    }

    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, organizationId: user.organizationId },
      select: { id: true, status: true }
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    if (transaction.status !== TransactionStatus.PENDING_PM_APPROVAL) {
      throw new BadRequestException('Transaction is not pending approval.');
    }

    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: TransactionStatus.APPROVED },
      select: TRANSACTION_SELECT
    });

    return { ...updated, totalAmount: Number(updated.totalAmount) };
  }

  async reject(transactionId: number, user: AuthUser) {
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException('Not allowed to reject transactions.');
    }

    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, organizationId: user.organizationId },
      select: { id: true, status: true }
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    if (transaction.status !== TransactionStatus.PENDING_PM_APPROVAL) {
      throw new BadRequestException('Transaction is not pending approval.');
    }

    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: TransactionStatus.REJECTED },
      select: TRANSACTION_SELECT
    });

    return { ...updated, totalAmount: Number(updated.totalAmount) };
  }

  private async getProjectForAccess(projectId: number, user: AuthUser) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: user.organizationId },
      select: {
        id: true,
        name: true,
        projectUsers: { select: { userId: true } }
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    if (ADMIN_ROLES.includes(user.role)) {
      return project;
    }

    const assigned = project.projectUsers.some(
      (projectUser) => projectUser.userId === user.userId
    );

    if (!assigned) {
      throw new ForbiddenException('Project access denied.');
    }

    return project;
  }
}
