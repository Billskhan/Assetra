"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../../platform/auth/current-user.decorator");
const jwt_auth_guard_1 = require("../../platform/auth/jwt-auth.guard");
const roles_decorator_1 = require("../../platform/auth/roles.decorator");
const roles_guard_1 = require("../../platform/auth/roles.guard");
const dashboard_service_1 = require("./dashboard.service");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getPmDashboard(user) {
        return this.dashboardService.getPmDashboard(user);
    }
    getManagerDashboard(user) {
        return this.dashboardService.getManagerDashboard(user);
    }
    getProjectDashboard(user, projectId) {
        return this.dashboardService.getProjectDashboard(projectId, user);
    }
    getApprovalQueue(user) {
        return this.dashboardService.getApprovalQueue(user);
    }
    getVendorPerformance(user) {
        return this.dashboardService.getVendorPerformance(user);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('pm'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getPmDashboard", null);
__decorate([
    (0, common_1.Get)('manager'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER, client_1.Role.MANAGER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getManagerDashboard", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER, client_1.Role.MANAGER, client_1.Role.STAKEHOLDER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getProjectDashboard", null);
__decorate([
    (0, common_1.Get)('approvals'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getApprovalQueue", null);
__decorate([
    (0, common_1.Get)('vendors/performance'),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER, client_1.Role.MANAGER),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getVendorPerformance", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map