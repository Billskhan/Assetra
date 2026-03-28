import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ContractStatus, Role } from '@prisma/client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { ADMIN_ROLES } from '../../common/roles';
import { CreateContractDto } from './dto/create-contract.dto';

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

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContractDto, user: AuthUser) {
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenException('Not allowed to create contracts.');
    }

    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, organizationId: user.organizationId },
      select: { id: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    const vendor = await this.prisma.vendor.findFirst({
      where: { id: dto.vendorId, organizationId: user.organizationId },
      select: { id: true }
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found.');
    }

    const contract = await this.prisma.contract.create({
      data: {
        organizationId: user.organizationId,
        title: dto.title,
        description: dto.description,
        totalAmount: dto.totalAmount,
        status: ContractStatus.DRAFT,
        projectId: project.id,
        vendorId: vendor.id
      },
      select: { id: true }
    });

    return { id: contract.id };
  }

  async findAll(user: AuthUser) {
    if (user.role === Role.VENDOR) {
      throw new ForbiddenException('Contract access denied.');
    }

    const where: Record<string, unknown> = {
      organizationId: user.organizationId
    };

    if (!ADMIN_ROLES.includes(user.role)) {
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

  async findOne(contractId: number, user: AuthUser) {
    if (user.role === Role.VENDOR) {
      throw new ForbiddenException('Contract access denied.');
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
      throw new NotFoundException('Contract not found.');
    }

    if (ADMIN_ROLES.includes(user.role)) {
      return {
        ...contract,
        project: { id: contract.project.id, name: contract.project.name },
        totalAmount: Number(contract.totalAmount)
      };
    }

    const assigned = contract.project.projectUsers.some(
      (projectUser) => projectUser.userId === user.userId
    );

    if (!assigned) {
      throw new ForbiddenException('Contract access denied.');
    }

    return {
      ...contract,
      project: { id: contract.project.id, name: contract.project.name },
      totalAmount: Number(contract.totalAmount)
    };
  }
}
