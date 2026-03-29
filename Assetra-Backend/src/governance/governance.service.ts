import { Injectable } from '@nestjs/common';

@Injectable()
export class GovernanceService {
  getStatus() {
    return { status: 'ok', module: 'governance' };
  }
}
