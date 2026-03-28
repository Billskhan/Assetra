import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractsService } from './contracts.service';
export declare class ContractsController {
    private contractsService;
    constructor(contractsService: ContractsService);
    create(user: AuthUser, dto: CreateContractDto): Promise<{
        id: number;
    }>;
    findAll(user: AuthUser): Promise<{
        totalAmount: number;
        project: {
            name: string;
            id: number;
        };
        vendor: {
            name: string;
            id: number;
        };
        id: number;
        createdAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.ContractStatus;
        description: string | null;
    }[]>;
    findOne(user: AuthUser, contractId: number): Promise<{
        project: {
            id: number;
            name: string;
        };
        totalAmount: number;
        vendor: {
            name: string;
            id: number;
        };
        id: number;
        createdAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.ContractStatus;
        description: string | null;
    }>;
}
