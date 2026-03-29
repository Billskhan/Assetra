import { Injectable } from '@nestjs/common';

@Injectable()
export class RbacService {
  getStatus() {
    return { status: 'ok', module: 'rbac' };
  }
}
