import { Injectable } from '@nestjs/common';

@Injectable()
export class VendorsService {
  getStatus() {
    return { status: 'ok', module: 'vendors' };
  }
}
