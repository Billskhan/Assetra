import { Module } from '@nestjs/common';
import { PrismaModule } from '../../platform/prisma/prisma.module';
import { AuthModule } from '../../platform/auth/auth.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService]
})
export class TransactionsModule {}
