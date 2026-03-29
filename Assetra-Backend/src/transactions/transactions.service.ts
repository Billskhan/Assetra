import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionsService {
  getStatus() {
    return { status: 'ok', module: 'transactions' };
  }
}
