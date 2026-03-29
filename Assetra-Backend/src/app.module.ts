import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './platform/prisma/prisma.module';
import { AuthModule } from './platform/auth/auth.module';
import { UsersModule } from './platform/users/users.module';
import { OrganizationsModule } from './platform/organizations/organizations.module';
import { AuditModule } from './platform/audit/audit.module';
import { ProjectsModule } from './construction/projects/projects.module';
import { VendorsModule } from './construction/vendors/vendors.module';
import { ContractsModule } from './construction/contracts/contracts.module';
import { TransactionsModule } from './construction/transactions/transactions.module';
import { GovernanceModule } from './construction/governance/governance.module';
import { DashboardModule } from './analytics/dashboard/dashboard.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    VendorsModule,
    ContractsModule,
    TransactionsModule,
    GovernanceModule,
    DashboardModule,
    AuditModule
  ]
})
export class AppModule {}
