import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Contract,
  CreateContractRequest,
  CreateContractResponse,
  VendorOption
} from './contracts.models';

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  constructor(private http: HttpClient) {}

  getContracts() {
    return this.http.get<Contract[]>('/contracts');
  }

  createContract(payload: CreateContractRequest) {
    return this.http.post<CreateContractResponse>('/contracts', payload);
  }

  getVendors() {
    return this.http.get<VendorOption[]>('/vendors');
  }
}
