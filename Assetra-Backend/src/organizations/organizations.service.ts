import { Injectable } from '@nestjs/common';

@Injectable()
export class OrganizationsService {
  getStatus() {
    return { status: 'ok', module: 'organizations' };
  }
}
