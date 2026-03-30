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
  description?: string | null;
  totalAmount: number | string;
  status: ContractStatus;
  organizationId: number;
  projectId: number;
  vendorId: number;
  createdAt: string;
  updatedAt: string;
  project?: ContractProjectRef | null;
  vendor?: ContractVendorRef | null;
}

export interface CreateContractRequest {
  title: string;
  description?: string;
  totalAmount: number;
  projectId: number;
  vendorId: number;
}

export type CreateContractResponse = Contract;

export interface VendorOption {
  id: number;
  name: string;
}

export interface ProjectOption {
  id: number;
  name: string;
}