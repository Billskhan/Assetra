import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditService {
  getStatus() {
    return { status: 'ok', module: 'audit' };
  }
}
