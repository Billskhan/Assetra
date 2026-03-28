import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  TransactionCreateRequest,
  TransactionCreateResponse
} from './transaction-create.models';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  constructor(private http: HttpClient) {}

  createTransaction(request: TransactionCreateRequest) {
    return this.http.post<TransactionCreateResponse>('/transactions', request);
  }
}
