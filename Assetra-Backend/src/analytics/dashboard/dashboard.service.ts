import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getStatus() {
    return { status: 'ok', module: 'dashboard' };
  }
}
