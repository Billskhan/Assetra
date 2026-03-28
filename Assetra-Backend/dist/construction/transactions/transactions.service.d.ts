import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class TransactionsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTransactionDto, user: AuthUser): Promise<{
        id: number;
    }>;
    findAll(user: AuthUser): Promise<{
        totalAmount: number;
        project: {
            name: string;
            id: number;
        };
        id: number;
        createdAt: Date;
        contractId: number | null;
        title: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
    }[]>;
    findByProject(projectId: number, user: AuthUser): Promise<{
        totalAmount: number;
        items: {
            unitPrice: number;
            total: number;
            name: string;
            id: number;
            quantity: number;
        }[];
        id: number;
        createdAt: Date;
        title: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
    }[]>;
    approve(transactionId: number, user: AuthUser): Promise<{
        totalAmount: number;
        project: {
            name: string;
            id: number;
        };
        id: number;
        createdAt: Date;
        contractId: number | null;
        title: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
    }>;
    reject(transactionId: number, user: AuthUser): Promise<{
        totalAmount: number;
        project: {
            name: string;
            id: number;
        };
        id: number;
        createdAt: Date;
        contractId: number | null;
        title: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
    }>;
    private getProjectForAccess;
}
