import { Module } from '@nestjs/common';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';
import { PrismaModule } from '../../platform/prisma/prisma.module';
import { AuthModule } from '../../platform/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [GovernanceService]
})
export class GovernanceModule {}
