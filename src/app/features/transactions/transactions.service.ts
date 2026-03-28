import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CreateTransactionRequest,
  CreateTransactionResponse
} from './transactions.models';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  constructor(private http: HttpClient) {}

  createTransaction(payload: CreateTransactionRequest) {
    return this.http.post<CreateTransactionResponse>('/transactions', payload);
  }
}
