import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CreateTransactionRequest,
  CreateTransactionResponse,
  Transaction
} from './transactions.models';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  constructor(private http: HttpClient) {}

  createTransaction(payload: CreateTransactionRequest) {
    return this.http.post<CreateTransactionResponse>('/transactions', payload);
  }

  getTransactions() {
    return this.http.get<Transaction[]>('/transactions');
  }

  getTransactionsByProject(projectId: number) {
    return this.http.get<Transaction[]>(
      `/transactions/project/${Number(projectId)}`
    );
  }
}
