import { PrismaService } from '../../platform/prisma/prisma.service';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { UpsertProjectGovernanceDto } from './dto/upsert-project-governance.dto';
export declare class GovernanceService {
    private prisma;
    constructor(prisma: PrismaService);
    findByProject(projectId: number, user: AuthUser): Promise<{
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        requireContractApproval: boolean;
        requirePaymentApproval: boolean;
        requireTxApproval: boolean;
    } | null>;
    upsertByProject(projectId: number, dto: UpsertProjectGovernanceDto, user: AuthUser): Promise<{
        createdAt: Date;
        updatedAt: Date;
        projectId: number;
        requireContractApproval: boolean;
        requirePaymentApproval: boolean;
        requireTxApproval: boolean;
    }>;
}
