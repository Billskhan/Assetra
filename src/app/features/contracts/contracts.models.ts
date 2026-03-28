export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ContractProjectRef {
  id: number;
  name: string;
}

export interface ContractVendorRef {
  id: number;
  name: string;
}

export interface Contract {
  id: number;
  title: string;
  totalAmount: number;
  status: ContractStatus;
  project: ContractProjectRef;
  vendor: ContractVendorRef;
  createdAt: string;
}

export interface CreateContractRequest {
  title: string;
  description?: string;
  totalAmount: number;
  projectId: number;
  vendorId: number;
}

export interface CreateContractResponse {
  id: number;
}

export interface VendorOption {
  id: number;
  name: string;
}

export interface ProjectOption {
  id: number;
  name: string;
}
