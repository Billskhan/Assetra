export interface CreateTransactionRequest {
  projectId: number;
  date: string;
  stageName?: string;
  entryType: TransactionEntryType;
  category: string;
  subCategory: string;
  item: string;
  receiptNo?: string;
  vendorId: number;
  quantity?: number;
  unit?: string;
  rate?: number;
  carriage?: number;
  length?: string;
  paymentMode: TransactionPaymentMode;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  comments?: string;
}

export interface CreateTransactionResponse {
  id: number;
}

export interface Transaction {
  id: number;
  organizationId?: number;
  projectId: number;
  vendorId: number;
  date: string | Date;
  stageName?: string | null;
  entryType: TransactionEntryType;
  category: string;
  subCategory: string;
  item: string;
  receiptNo?: string | null;
  quantity?: number | null;
  unit?: string | null;
  rate?: number | null;
  carriage?: number | null;
  length?: string | null;
  paymentMode: TransactionPaymentMode;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  comments?: string | null;
  createdBy?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type TransactionEntryType = 'Service' | 'Material';

export type TransactionPaymentMode = 'Cash' | 'Bank' | 'Online' | 'Cheque';
