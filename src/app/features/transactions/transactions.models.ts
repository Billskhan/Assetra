export interface TransactionItemRequest {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateTransactionRequest {
  title: string;
  projectId: number;
  contractId?: number;
  items: TransactionItemRequest[];
}

export interface CreateTransactionResponse {
  id: number | string;
}
