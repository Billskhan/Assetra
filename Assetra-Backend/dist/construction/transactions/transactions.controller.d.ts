import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private transactionsService;
    constructor(transactionsService: TransactionsService);
    create(user: AuthUser, dto: CreateTransactionDto): Promise<{
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
    findByProject(user: AuthUser, projectId: number): Promise<{
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
    approve(user: AuthUser, transactionId: number): Promise<{
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
    reject(user: AuthUser, transactionId: number): Promise<{
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
}
