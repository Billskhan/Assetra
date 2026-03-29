import { Controller, Get } from '@nestjs/common';
import { RbacService } from './rbac.service';

@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  status() {
    return this.rbacService.getStatus();
  }
}
