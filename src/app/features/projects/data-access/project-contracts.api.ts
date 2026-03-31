import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type ProjectContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type ProjectContractMilestoneStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED';

export type ProjectContractPaymentMode = 'CASH' | 'BANK' | 'ONLINE' | 'CHEQUE';

export interface ProjectContractSummary {
  id: number;
  title: string;
  vendorId: number;
  vendorName: string;
  type: string | null;
  totalAmount: number;
  totalPaid: number;
  balance: number;
  status: ProjectContractStatus;
  milestoneCount: number;
  paidMilestoneCount: number;
}

export interface ProjectContractMilestone {
  id: number;
  name: string;
  sequenceNo: number;
  targetValue?: number | null;
  unit?: string | null;
  amount: number;
  paidAmount: number;
  balance: number;
  status: ProjectContractMilestoneStatus;
  completedOn?: string | null;
  remarks?: string | null;
}

export interface ProjectContractPayment {
  id: number;
  milestoneId: number | null;
  milestoneName: string | null;
  milestoneSequenceNo: number | null;
  paymentDate: string;
  amount: number;
  paymentMode: ProjectContractPaymentMode | null;
  receiptNo: string | null;
  remarks: string | null;
  createdAt: string;
}

export interface ProjectContractDetail {
  id: number;
  projectId: number;
  title: string;
  type: string | null;
  scopeOfWork: string | null;
  totalAmount: number;
  startDate: string | null;
  expectedEndDate: string | null;
  notes: string | null;
  status: ProjectContractStatus;
  vendor: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  totals: {
    totalAmount: number;
    totalPaid: number;
    balance: number;
  };
  milestones: ProjectContractMilestone[];
  payments: ProjectContractPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectContractPayload {
  projectId: number;
  vendorId: number;
  title: string;
  type?: string;
  scopeOfWork?: string;
  totalAmount: number;
  startDate?: string;
  expectedEndDate?: string;
  notes?: string;
  milestones: Array<{
    name: string;
    sequenceNo: number;
    targetValue?: number;
    unit?: string;
    amount: number;
    remarks?: string;
  }>;
}

export interface CreateProjectContractResponse {
  id: number;
}

export interface RecordProjectContractPaymentPayload {
  contractId: number;
  milestoneId?: number;
  paymentDate: string;
  amount: number;
  paymentMode?: ProjectContractPaymentMode;
  receiptNo?: string;
  remarks?: string;
}

export interface ContractPaymentsResponse {
  contractId: number;
  totalAmount: number;
  totalPaid: number;
  balance: number;
  payments: ProjectContractPayment[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectContractsApi {
  constructor(private readonly http: HttpClient) {}

  getProjectContracts(projectId: number) {
    return this.http.get<ProjectContractSummary[]>(
      `/contracts/project/${Number(projectId)}`
    );
  }

  getContractById(id: number) {
    return this.http.get<ProjectContractDetail>(`/contracts/${Number(id)}`);
  }

  createContract(payload: CreateProjectContractPayload) {
    return this.http.post<CreateProjectContractResponse>('/contracts', payload);
  }

  recordPayment(payload: RecordProjectContractPaymentPayload) {
    return this.http.post('/contracts/payments', payload);
  }

  getContractPayments(contractId: number) {
    return this.http.get<ContractPaymentsResponse>(
      `/contracts/${Number(contractId)}/payments`
    );
  }
}
