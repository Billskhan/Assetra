import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateContractDto } from './dto/create-contract.dto';
export declare class ContractsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateContractDto, user: AuthUser): Promise<{
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
    findOne(contractId: number, user: AuthUser): Promise<{
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
