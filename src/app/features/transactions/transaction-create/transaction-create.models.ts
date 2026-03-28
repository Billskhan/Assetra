export interface TransactionItemInput {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface TransactionCreateRequest {
  title: string;
  projectId: string;
  contractId?: string | null;
  items: TransactionItemInput[];
}

export interface TransactionCreateResponse {
  id: string;
}
