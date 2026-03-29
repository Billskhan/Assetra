import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../platform/prisma/prisma.service';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { UpsertProjectGovernanceDto } from './dto/upsert-project-governance.dto';

@Injectable()
export class GovernanceService {
  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: number, user: AuthUser) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.projectGovernance.findUnique({
      where: { projectId }
    });
  }

  async upsertByProject(
    projectId: number,
    dto: UpsertProjectGovernanceDto,
    user: AuthUser
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.projectGovernance.upsert({
      where: { projectId },
      update: {
        requireContractApproval: dto.requireContractApproval,
        requirePaymentApproval: dto.requirePaymentApproval,
        requireTxApproval: dto.requireTxApproval
      },
      create: {
        projectId,
        requireContractApproval: dto.requireContractApproval,
        requirePaymentApproval: dto.requirePaymentApproval,
        requireTxApproval: dto.requireTxApproval
      }
    });
  }
}
