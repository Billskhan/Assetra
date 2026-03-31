import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  ContractMilestoneStatus,
  ContractStatus,
  PaymentMode,
  Prisma,
  Role
} from '@prisma/client';
import type { AuthUser } from '../platform/auth/interfaces/auth-user.interface';
import { PrismaService } from '../platform/prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import {
  ContractPaymentModeDto,
  RecordContractPaymentDto
} from './dto/record-contract-payment.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

const CURRENCY_EPSILON = 0.01;

const DTO_TO_PRISMA_PAYMENT_MODE: Record<ContractPaymentModeDto, PaymentMode> = {
  [ContractPaymentModeDto.CASH]: PaymentMode.Cash,
  [ContractPaymentModeDto.BANK]: PaymentMode.Bank,
  [ContractPaymentModeDto.ONLINE]: PaymentMode.Online,
  [ContractPaymentModeDto.CHEQUE]: PaymentMode.Cheque
};

const PRISMA_TO_DTO_PAYMENT_MODE: Record<PaymentMode, ContractPaymentModeDto> = {
  [PaymentMode.Cash]: ContractPaymentModeDto.CASH,
  [PaymentMode.Bank]: ContractPaymentModeDto.BANK,
  [PaymentMode.Online]: ContractPaymentModeDto.ONLINE,
  [PaymentMode.Cheque]: ContractPaymentModeDto.CHEQUE
};

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContractDto, user: AuthUser) {
    const project = await this.getAccessibleProject(dto.projectId, user);

    const vendor = await this.prisma.vendor.findFirst({
      where: {
        id: dto.vendorId,
        organizationId: user.organizationId
      },
      select: {
        id: true,
        name: true
      }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
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
      throw new BadRequestException(
        'Vendor is not attached to the selected project'
      );
    }

    const milestones = this.normalizeMilestones(dto);
    const totalAmount = this.toCurrency(dto.totalAmount, 'totalAmount', true);

    if (!milestones.length) {
      throw new BadRequestException('At least one milestone is required');
    }

    const milestoneTotal = this.roundCurrency(
      milestones.reduce((sum, milestone) => sum + milestone.amount, 0)
    );

    if (Math.abs(milestoneTotal - totalAmount) > CURRENCY_EPSILON) {
      throw new BadRequestException(
        'Sum of milestone amounts must equal contract totalAmount'
      );
    }

    const startDate = this.toOptionalDate(dto.startDate, 'startDate');
    const expectedEndDate = this.toOptionalDate(
      dto.expectedEndDate,
      'expectedEndDate'
    );

    if (startDate && expectedEndDate && expectedEndDate < startDate) {
      throw new BadRequestException('expectedEndDate cannot be before startDate');
    }

    const created = await this.prisma.contract.create({
      data: {
        organizationId: user.organizationId,
        projectId: project.id,
        vendorId: vendor.id,
        title: this.normalizeRequiredString(dto.title, 'title'),
        type: this.normalizeOptionalString(dto.type),
        scopeOfWork: this.normalizeOptionalString(dto.scopeOfWork),
        totalAmount,
        status: ContractStatus.ACTIVE,
        startDate,
        expectedEndDate,
        notes: this.normalizeOptionalString(dto.notes),
        milestones: {
          create: milestones.map((milestone) => ({
            organizationId: user.organizationId,
            name: milestone.name,
            sequenceNo: milestone.sequenceNo,
            targetValue: milestone.targetValue,
            unit: milestone.unit,
            amount: milestone.amount,
            remarks: milestone.remarks
          }))
        }
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true
          }
        },
        milestones: {
          orderBy: {
            sequenceNo: 'asc'
          }
        }
      }
    });

    return {
      id: created.id,
      projectId: created.projectId,
      vendor: created.vendor,
      title: created.title,
      type: created.type,
      totalAmount: Number(created.totalAmount),
      status: created.status,
      milestones: created.milestones.map((milestone) => ({
        id: milestone.id,
        name: milestone.name,
        sequenceNo: milestone.sequenceNo,
        amount: Number(milestone.amount),
        paidAmount: Number(milestone.paidAmount),
        balance: this.roundCurrency(
          Number(milestone.amount) - Number(milestone.paidAmount)
        ),
        status: milestone.status
      })),
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    };
  }

  async findAll(user: AuthUser) {
    const where =
      user.role === Role.ADMIN || user.role === Role.PROJECT_MANAGER
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

    const contracts = await this.prisma.contract.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            name: true
          }
        },
        milestones: {
          select: {
            status: true
          }
        },
        payments: {
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return contracts.map((contract) => this.mapContractSummary(contract));
  }

  async findByProject(projectId: number, user: AuthUser) {
    await this.getAccessibleProject(projectId, user);

    const contracts = await this.prisma.contract.findMany({
      where: {
        organizationId: user.organizationId,
        projectId
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true
          }
        },
        milestones: {
          select: {
            status: true
          }
        },
        payments: {
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return contracts.map((contract) => this.mapContractSummary(contract));
  }

  async findOne(contractId: number, user: AuthUser) {
    const contract = await this.prisma.contract.findFirst({
      where: {
        id: contractId,
        organizationId: user.organizationId
      },
      include: {
        project: {
          select: {
            id: true,
            projectUsers: {
              select: {
                userId: true
              }
            }
          }
        },
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        milestones: {
          orderBy: {
            sequenceNo: 'asc'
          }
        },
        payments: {
          include: {
            milestone: {
              select: {
                id: true,
                name: true,
                sequenceNo: true
              }
            }
          },
          orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }]
        }
      }
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    this.ensureProjectAccess(user, contract.project.projectUsers);

    const totalAmount = Number(contract.totalAmount);
    const totalPaid = this.roundCurrency(
      contract.payments.reduce(
        (sum, payment) => sum + Number(payment.amount ?? 0),
        0
      )
    );

    return {
      id: contract.id,
      projectId: contract.projectId,
      title: contract.title,
      type: contract.type,
      scopeOfWork: contract.scopeOfWork,
      totalAmount,
      startDate: contract.startDate,
      expectedEndDate: contract.expectedEndDate,
      notes: contract.notes,
      status: contract.status,
      vendor: contract.vendor,
      totals: {
        totalAmount,
        totalPaid,
        balance: this.roundCurrency(totalAmount - totalPaid)
      },
      milestones: contract.milestones.map((milestone) => ({
        id: milestone.id,
        name: milestone.name,
        sequenceNo: milestone.sequenceNo,
        targetValue: milestone.targetValue,
        unit: milestone.unit,
        amount: Number(milestone.amount),
        paidAmount: Number(milestone.paidAmount),
        balance: this.roundCurrency(
          Number(milestone.amount) - Number(milestone.paidAmount)
        ),
        status: milestone.status,
        completedOn: milestone.completedOn,
        remarks: milestone.remarks
      })),
      payments: contract.payments.map((payment) =>
        this.mapPaymentHistoryItem(payment)
      ),
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt
    };
  }

  async update(contractId: number, dto: UpdateContractDto, user: AuthUser) {
    const contract = await this.getAccessibleContract(contractId, user);

    const nextStartDate =
      dto.startDate !== undefined
        ? this.toOptionalDate(dto.startDate, 'startDate')
        : contract.startDate;

    const nextExpectedEndDate =
      dto.expectedEndDate !== undefined
        ? this.toOptionalDate(dto.expectedEndDate, 'expectedEndDate')
        : contract.expectedEndDate;

    if (nextStartDate && nextExpectedEndDate && nextExpectedEndDate < nextStartDate) {
      throw new BadRequestException('expectedEndDate cannot be before startDate');
    }

    const updated = await this.prisma.contract.update({
      where: {
        id: contract.id
      },
      data: {
        title:
          dto.title !== undefined
            ? this.normalizeRequiredString(dto.title, 'title')
            : undefined,
        type:
          dto.type !== undefined
            ? this.normalizeOptionalString(dto.type)
            : undefined,
        scopeOfWork:
          dto.scopeOfWork !== undefined
            ? this.normalizeOptionalString(dto.scopeOfWork)
            : undefined,
        startDate: dto.startDate !== undefined ? nextStartDate : undefined,
        expectedEndDate:
          dto.expectedEndDate !== undefined ? nextExpectedEndDate : undefined,
        notes:
          dto.notes !== undefined
            ? this.normalizeOptionalString(dto.notes)
            : undefined
      },
      select: {
        id: true,
        title: true,
        type: true,
        scopeOfWork: true,
        startDate: true,
        expectedEndDate: true,
        notes: true,
        status: true,
        updatedAt: true
      }
    });

    return updated;
  }

  async recordPayment(dto: RecordContractPaymentDto, user: AuthUser) {
    return this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.findFirst({
        where: {
          id: dto.contractId,
          organizationId: user.organizationId
        },
        include: {
          project: {
            select: {
              id: true,
              projectUsers: {
                select: {
                  userId: true
                }
              }
            }
          }
        }
      });

      if (!contract) {
        throw new NotFoundException('Contract not found');
      }

      this.ensureProjectAccess(user, contract.project.projectUsers);

      if (contract.status === ContractStatus.CANCELLED) {
        throw new BadRequestException('Cannot record payment for a cancelled contract');
      }

      const paymentAmount = this.toCurrency(dto.amount, 'amount', true);
      if (paymentAmount <= 0) {
        throw new BadRequestException('Payment amount must be greater than 0');
      }

      const paymentDate = this.toDate(dto.paymentDate, 'paymentDate');

      const paidAggregate = await tx.contractPayment.aggregate({
        where: {
          contractId: contract.id,
          organizationId: user.organizationId
        },
        _sum: {
          amount: true
        }
      });

      const totalAmount = Number(contract.totalAmount);
      const totalPaidBefore = Number(paidAggregate._sum.amount ?? 0);
      const contractRemaining = this.roundCurrency(totalAmount - totalPaidBefore);

      if (paymentAmount - contractRemaining > CURRENCY_EPSILON) {
        throw new BadRequestException(
          'Payment amount cannot exceed remaining contract balance'
        );
      }

      let milestoneForPayment:
        | {
            id: number;
            amount: number;
          }
        | null = null;

      let milestonePaidBefore = 0;

      if (dto.milestoneId) {
        const milestone = await tx.contractMilestone.findFirst({
          where: {
            id: dto.milestoneId,
            contractId: contract.id,
            organizationId: user.organizationId
          },
          select: {
            id: true,
            amount: true
          }
        });

        if (!milestone) {
          throw new NotFoundException('Milestone not found for the selected contract');
        }

        milestoneForPayment = {
          id: milestone.id,
          amount: Number(milestone.amount)
        };

        const milestonePaidAggregate = await tx.contractPayment.aggregate({
          where: {
            contractId: contract.id,
            milestoneId: milestone.id,
            organizationId: user.organizationId
          },
          _sum: {
            amount: true
          }
        });

        milestonePaidBefore = Number(milestonePaidAggregate._sum.amount ?? 0);
        const milestoneRemaining = this.roundCurrency(
          milestoneForPayment.amount - milestonePaidBefore
        );

        if (paymentAmount - milestoneRemaining > CURRENCY_EPSILON) {
          throw new BadRequestException(
            'Payment amount cannot exceed remaining milestone balance'
          );
        }
      }

      const createdPayment = await tx.contractPayment.create({
        data: {
          contractId: contract.id,
          milestoneId: milestoneForPayment?.id,
          organizationId: user.organizationId,
          paymentDate,
          amount: paymentAmount,
          paymentMode: dto.paymentMode
            ? DTO_TO_PRISMA_PAYMENT_MODE[dto.paymentMode]
            : undefined,
          receiptNo: this.normalizeOptionalString(dto.receiptNo),
          remarks: this.normalizeOptionalString(dto.remarks)
        },
        include: {
          milestone: {
            select: {
              id: true,
              name: true,
              sequenceNo: true
            }
          }
        }
      });

      if (milestoneForPayment) {
        const milestonePaidAfter = this.roundCurrency(
          milestonePaidBefore + paymentAmount
        );

        await tx.contractMilestone.update({
          where: {
            id: milestoneForPayment.id
          },
          data: {
            paidAmount: milestonePaidAfter,
            status: this.getMilestoneStatus(
              milestonePaidAfter,
              milestoneForPayment.amount
            ),
            completedOn:
              milestonePaidAfter >= milestoneForPayment.amount
                ? paymentDate
                : null
          }
        });
      }

      const totalPaidAfterAggregate = await tx.contractPayment.aggregate({
        where: {
          contractId: contract.id,
          organizationId: user.organizationId
        },
        _sum: {
          amount: true
        }
      });

      const totalPaidAfter = Number(totalPaidAfterAggregate._sum.amount ?? 0);
      const balanceAfter = this.roundCurrency(totalAmount - totalPaidAfter);
      const nextStatus =
        balanceAfter <= CURRENCY_EPSILON
          ? ContractStatus.COMPLETED
          : ContractStatus.ACTIVE;

      if (contract.status !== nextStatus) {
        await tx.contract.update({
          where: {
            id: contract.id
          },
          data: {
            status: nextStatus
          }
        });
      }

      return {
        payment: this.mapPaymentHistoryItem(createdPayment),
        totals: {
          totalAmount,
          totalPaid: this.roundCurrency(totalPaidAfter),
          balance: this.roundCurrency(balanceAfter)
        },
        status: nextStatus
      };
    });
  }

  async getPaymentHistory(contractId: number, user: AuthUser) {
    const contract = await this.getAccessibleContract(contractId, user);

    const payments = await this.prisma.contractPayment.findMany({
      where: {
        contractId: contract.id,
        organizationId: user.organizationId
      },
      include: {
        milestone: {
          select: {
            id: true,
            name: true,
            sequenceNo: true
          }
        }
      },
      orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }]
    });

    const totalAmount = Number(contract.totalAmount);
    const totalPaid = this.roundCurrency(
      payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)
    );

    return {
      contractId: contract.id,
      totalAmount,
      totalPaid,
      balance: this.roundCurrency(totalAmount - totalPaid),
      payments: payments.map((payment) => this.mapPaymentHistoryItem(payment))
    };
  }

  private async getAccessibleProject(projectId: number, user: AuthUser) {
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
      throw new NotFoundException('Project not found');
    }

    this.ensureProjectAccess(user, project.projectUsers);

    return project;
  }

  private async getAccessibleContract(contractId: number, user: AuthUser) {
    const contract = await this.prisma.contract.findFirst({
      where: {
        id: contractId,
        organizationId: user.organizationId
      },
      include: {
        project: {
          select: {
            id: true,
            projectUsers: {
              select: {
                userId: true
              }
            }
          }
        }
      }
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    this.ensureProjectAccess(user, contract.project.projectUsers);

    return contract;
  }

  private ensureProjectAccess(
    user: AuthUser,
    projectUsers: Array<{ userId: number }>
  ) {
    const canAccess =
      user.role === Role.ADMIN ||
      user.role === Role.PROJECT_MANAGER ||
      projectUsers.some((projectUser) => projectUser.userId === user.userId);

    if (!canAccess) {
      throw new ForbiddenException('Project access denied');
    }
  }

  private normalizeMilestones(dto: CreateContractDto) {
    const seenSequence = new Set<number>();

    return dto.milestones.map((milestone, index) => {
      const sequenceNo = Number(milestone.sequenceNo);
      if (seenSequence.has(sequenceNo)) {
        throw new BadRequestException(
          'Milestone sequenceNo must be unique within the contract'
        );
      }
      seenSequence.add(sequenceNo);

      return {
        name: this.normalizeRequiredString(
          milestone.name,
          `milestones[${index}].name`
        ),
        sequenceNo,
        targetValue:
          milestone.targetValue === undefined || milestone.targetValue === null
            ? undefined
            : Number(milestone.targetValue),
        unit: this.normalizeOptionalString(milestone.unit),
        amount: this.toCurrency(
          milestone.amount,
          `milestones[${index}].amount`,
          true
        ),
        remarks: this.normalizeOptionalString(milestone.remarks)
      };
    });
  }

  private mapContractSummary(contract: {
    id: number;
    title: string;
    vendorId: number;
    vendor: { name: string };
    type: string | null;
    totalAmount: Prisma.Decimal;
    status: ContractStatus;
    milestones: Array<{ status: ContractMilestoneStatus }>;
    payments: Array<{ amount: number | Prisma.Decimal }>;
  }) {
    const totalAmount = Number(contract.totalAmount);
    const totalPaid = this.roundCurrency(
      contract.payments.reduce(
        (sum, payment) => sum + Number(payment.amount ?? 0),
        0
      )
    );

    return {
      id: contract.id,
      title: contract.title,
      vendorId: contract.vendorId,
      vendorName: contract.vendor.name,
      type: contract.type,
      totalAmount,
      totalPaid,
      balance: this.roundCurrency(totalAmount - totalPaid),
      status: contract.status,
      milestoneCount: contract.milestones.length,
      paidMilestoneCount: contract.milestones.filter(
        (milestone) => milestone.status === ContractMilestoneStatus.PAID
      ).length
    };
  }

  private mapPaymentHistoryItem(payment: {
    id: number;
    milestoneId: number | null;
    paymentDate: Date;
    amount: number | Prisma.Decimal;
    paymentMode: PaymentMode | null;
    receiptNo: string | null;
    remarks: string | null;
    createdAt: Date;
    milestone?: {
      id: number;
      name: string;
      sequenceNo: number;
    } | null;
  }) {
    return {
      id: payment.id,
      milestoneId: payment.milestoneId,
      milestoneName: payment.milestone?.name ?? null,
      milestoneSequenceNo: payment.milestone?.sequenceNo ?? null,
      paymentDate: payment.paymentDate,
      amount: Number(payment.amount),
      paymentMode: payment.paymentMode
        ? PRISMA_TO_DTO_PAYMENT_MODE[payment.paymentMode]
        : null,
      receiptNo: payment.receiptNo,
      remarks: payment.remarks,
      createdAt: payment.createdAt
    };
  }

  private getMilestoneStatus(paidAmount: number, amount: number) {
    if (paidAmount <= CURRENCY_EPSILON) {
      return ContractMilestoneStatus.PENDING;
    }

    if (amount - paidAmount <= CURRENCY_EPSILON) {
      return ContractMilestoneStatus.PAID;
    }

    return ContractMilestoneStatus.PARTIALLY_PAID;
  }

  private normalizeRequiredString(value: string, fieldName: string) {
    const normalized = value?.trim();
    if (!normalized) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    return normalized;
  }

  private normalizeOptionalString(value?: string | null) {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }

  private toOptionalDate(value: string | undefined, fieldName: string) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    return this.toDate(value, fieldName);
  }

  private toDate(value: string, fieldName: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid date`);
    }

    return parsed;
  }

  private toCurrency(value: number, fieldName: string, required = false) {
    if (value === undefined || value === null) {
      if (!required) {
        return 0;
      }
      throw new BadRequestException(`${fieldName} is required`);
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`${fieldName} must be a valid number`);
    }

    if (parsed < 0) {
      throw new BadRequestException(`${fieldName} cannot be less than 0`);
    }

    return this.roundCurrency(parsed);
  }

  private roundCurrency(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
