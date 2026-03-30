import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  CreateTransactionRequest,
  CreateTransactionResponse
} from './transactions.models';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  createTransaction(_payload: CreateTransactionRequest): Observable<CreateTransactionResponse> {
    return throwError(() =>
      new Error('Transactions API is not available on the backend yet.')
    );
  }
}