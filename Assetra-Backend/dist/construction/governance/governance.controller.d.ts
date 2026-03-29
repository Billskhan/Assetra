import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { GovernanceService } from './governance.service';
import { UpsertProjectGovernanceDto } from './dto/upsert-project-governance.dto';
export declare class GovernanceController {
    private readonly governanceService;
    constructor(governanceService: GovernanceService);
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
