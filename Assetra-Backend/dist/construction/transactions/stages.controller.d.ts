import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { TransactionsService } from './transactions.service';
export declare class StagesController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findByProject(projectId: number, user: AuthUser): Promise<{
        id: number;
        name: string;
        projectId: number;
        createdAt: Date;
    }[]>;
}
