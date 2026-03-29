import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Contract, ContractStatus, Role } from '@prisma/client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateContractDto } from './dto/create-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContractDto, user: AuthUser): Promise<Contract> {
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
      throw new NotFoundException('Project not found');
    }

    const canAccess =
      user.role === Role.ADMIN ||
      user.role === Role.PROJECT_MANAGER ||
      project.projectUsers.some((pu) => pu.userId === user.userId);

    if (!canAccess) {
      throw new ForbiddenException('Project access denied');
    }

    const vendor = await this.prisma.vendor.findFirst({
      where: {
        id: dto.vendorId,
        organizationId: user.organizationId
      }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const governance = await this.prisma.projectGovernance.findUnique({
      where: {
        projectId: dto.projectId
      }
    });

    const status = governance?.requireContractApproval
      ? ContractStatus.DRAFT
      : ContractStatus.ACTIVE;

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

  async findAll(user: AuthUser): Promise<Contract[]> {
    if (user.role === Role.ADMIN || user.role === Role.PROJECT_MANAGER) {
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

  async findByProject(projectId: number, user: AuthUser): Promise<Contract[]> {
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
      throw new NotFoundException('Project not found');
    }

    const canAccess =
      user.role === Role.ADMIN ||
      user.role === Role.PROJECT_MANAGER ||
      project.projectUsers.some((pu) => pu.userId === user.userId);

    if (!canAccess) {
      throw new ForbiddenException('Project access denied');
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

  async approve(contractId: number, user: AuthUser): Promise<Contract> {
    if (user.role !== Role.ADMIN && user.role !== Role.PROJECT_MANAGER) {
      throw new ForbiddenException('Approval not allowed');
    }

    const contract = await this.prisma.contract.findFirst({
      where: {
        id: contractId,
        organizationId: user.organizationId
      }
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return this.prisma.contract.update({
      where: { id: contractId },
      data: { status: ContractStatus.ACTIVE }
    });
  }
}
