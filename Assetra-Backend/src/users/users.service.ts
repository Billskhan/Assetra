import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getStatus() {
    return { status: 'ok', module: 'users' };
  }
}
