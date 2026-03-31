import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Vendor {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  isGlobal?: boolean | null;
  createdAt?: string | Date;
}

export interface VendorAttachResponse {
  success: boolean;
  alreadyAttached?: boolean;
  attachment?: {
    id: number;
    createdAt: string;
  };
}

export interface VendorOutstandingSummary {
  vendorId: number;
  vendorName: string;
  totalTransactionAmount: number;
  totalPaidAmount: number;
  totalBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class VendorsService {
  constructor(private http: HttpClient) {}

  getVendors() {
    return this.http.get<Vendor[]>('/vendors');
  }

  createVendor(payload: {
    name: string;
    email?: string;
    phone?: string;
    isGlobal?: boolean;
    projectId?: number;
  }) {
    return this.http.post<Vendor>('/vendors', payload);
  }

  attachVendorToProject(vendorId: number, projectId: number) {
    return this.http.post<VendorAttachResponse>(
      `/vendors/${Number(vendorId)}/attach/${Number(projectId)}`,
      {},
    );
  }

  getVendorsByProject(projectId: number) {
    return this.http.get<Vendor[]>(`/vendors/project/${Number(projectId)}`);
  }

  getOutstandingSummary() {
    return this.http.get<VendorOutstandingSummary[]>('/vendors/outstanding-summary');
  }
}
