import { Injectable } from '@nestjs/common';

@Injectable()
export class ContractsService {
  getStatus() {
    return { status: 'ok', module: 'contracts' };
  }
}
