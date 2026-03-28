import { Module } from '@nestjs/common';
import { PrismaModule } from '../../platform/prisma/prisma.module';
import { AuthModule } from '../../platform/auth/auth.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService]
})
export class DashboardModule {}
