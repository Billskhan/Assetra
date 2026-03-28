import { TransactionItemDto } from './transaction-item.dto';
export declare class CreateTransactionDto {
    title: string;
    projectId: number;
    contractId?: number;
    items: TransactionItemDto[];
}
