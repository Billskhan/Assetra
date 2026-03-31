import { Module } from '@nestjs/common';
import { AuthModule } from '../platform/auth/auth.module';
import { PrismaModule } from '../platform/prisma/prisma.module';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService]
})
export class ContractsModule {}
