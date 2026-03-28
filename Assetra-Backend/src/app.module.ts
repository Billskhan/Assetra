import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './analytics/dashboard/dashboard.module';
import { ContractsModule } from './construction/contracts/contracts.module';
import { ProjectsModule } from './construction/projects/projects.module';
import { TransactionsModule } from './construction/transactions/transactions.module';
import { VendorsModule } from './construction/vendors/vendors.module';
import { AuthModule } from './platform/auth/auth.module';
import { PrismaModule } from './platform/prisma/prisma.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    VendorsModule,
    ContractsModule,
    TransactionsModule,
    DashboardModule
  ]
})
export class AppModule {}
