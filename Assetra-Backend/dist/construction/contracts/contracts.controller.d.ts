import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    create(dto: CreateContractDto, user: AuthUser): Promise<{
        id: number;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: number;
        vendorId: number;
        title: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.ContractStatus;
    }>;
    findAll(user: AuthUser): Promise<{
        id: number;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: number;
        vendorId: number;
        title: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.ContractStatus;
    }[]>;
    findByProject(projectId: number, user: AuthUser): Promise<{
        id: number;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: number;
        vendorId: number;
        title: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.ContractStatus;
    }[]>;
    approve(contractId: number, user: AuthUser): Promise<{
        id: number;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: number;
        vendorId: number;
        title: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.ContractStatus;
    }>;
}
