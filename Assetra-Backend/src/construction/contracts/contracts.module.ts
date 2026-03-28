import { Module } from '@nestjs/common';
import { PrismaModule } from '../../platform/prisma/prisma.module';
import { AuthModule } from '../../platform/auth/auth.module';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService]
})
export class ContractsModule {}
