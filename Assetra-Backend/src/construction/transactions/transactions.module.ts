import { Module } from '@nestjs/common';
import { AuthModule } from '../../platform/auth/auth.module';
import { PrismaModule } from '../../platform/prisma/prisma.module';
import { ProjectTransactionsController } from './project-transactions.controller';
import { StagesController } from './stages.controller';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    TransactionsController,
    ProjectTransactionsController,
    StagesController
  ],
  providers: [TransactionsService]
})
export class TransactionsModule {}
