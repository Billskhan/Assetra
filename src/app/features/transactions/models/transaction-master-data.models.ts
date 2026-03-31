export interface Category {
  id: string;
  name: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface Item {
  id: string;
  subCategoryId: string;
  name: string;
  defaultUnit?: string;
  isActive?: boolean;
}

export interface Stage {
  id: string;
  name: string;
  sortOrder?: number;
}

export type TransactionEntryType = 'SERVICE' | 'MATERIAL';

export type TransactionPaymentMode =
  | 'CASH'
  | 'BANK'
  | 'ONLINE'
  | 'CHEQUE'
  | 'CREDIT'
  | 'ADVANCE';

export interface TransactionCreatePayload {
  projectId: string;
  stageId: string;
  categoryId: string;
  subCategoryId: string;
  itemId?: string | null;
  customItemText?: string | null;
  vendorId?: string | null;
  date: string;
  entryType: TransactionEntryType;
  quantity?: number | null;
  unit?: string | null;
  rate?: number | null;
  carriage?: number | null;
  totalAmount: number;
  paidAmount?: number | null;
  balanceAmount?: number | null;
  paymentMode?: TransactionPaymentMode | null;
  comments?: string | null;
}
