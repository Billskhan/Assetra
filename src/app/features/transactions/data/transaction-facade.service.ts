import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { TransactionCreatePayload } from '../models/transaction-master-data.models';

@Injectable({
  providedIn: 'root'
})
export class TransactionFacadeService {
  createTransaction(_payload: TransactionCreatePayload): Observable<{ id: string }> {
    return of({ id: crypto.randomUUID() }).pipe(delay(350));
  }
}
