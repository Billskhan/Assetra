import { EntryType, PaymentMode } from '@prisma/client';
export declare class CreateTransactionDto {
    projectId?: number;
    stageName?: string;
    vendorId: number;
    date: string;
    entryType: EntryType;
    category: string;
    subCategory: string;
    item: string;
    quantity?: number;
    unit?: string;
    rate?: number;
    carriage?: number;
    length?: string;
    paymentMode: PaymentMode;
    totalAmount: number;
    paidAmount?: number;
    balance?: number;
    receiptNo?: string;
    comments?: string;
}
