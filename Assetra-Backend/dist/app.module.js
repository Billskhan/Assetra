"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const prisma_module_1 = require("./platform/prisma/prisma.module");
const auth_module_1 = require("./platform/auth/auth.module");
const users_module_1 = require("./platform/users/users.module");
const organizations_module_1 = require("./platform/organizations/organizations.module");
const audit_module_1 = require("./platform/audit/audit.module");
const projects_module_1 = require("./construction/projects/projects.module");
const vendors_module_1 = require("./construction/vendors/vendors.module");
const contracts_module_1 = require("./construction/contracts/contracts.module");
const transactions_module_1 = require("./construction/transactions/transactions.module");
const governance_module_1 = require("./construction/governance/governance.module");
const dashboard_module_1 = require("./analytics/dashboard/dashboard.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            projects_module_1.ProjectsModule,
            vendors_module_1.VendorsModule,
            contracts_module_1.ContractsModule,
            transactions_module_1.TransactionsModule,
            governance_module_1.GovernanceModule,
            dashboard_module_1.DashboardModule,
            audit_module_1.AuditModule
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map