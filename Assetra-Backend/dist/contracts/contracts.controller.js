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
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../platform/auth/current-user.decorator");
const jwt_auth_guard_1 = require("../platform/auth/jwt-auth.guard");
const roles_decorator_1 = require("../platform/auth/roles.decorator");
const roles_guard_1 = require("../platform/auth/roles.guard");
const contracts_service_1 = require("./contracts.service");
const create_contract_dto_1 = require("./dto/create-contract.dto");
const record_contract_payment_dto_1 = require("./dto/record-contract-payment.dto");
const update_contract_dto_1 = require("./dto/update-contract.dto");
let ContractsController = class ContractsController {
    constructor(contractsService) {
        this.contractsService = contractsService;
    }
    create(dto, user) {
        return this.contractsService.create(dto, user);
    }
    findAll(user) {
        return this.contractsService.findAll(user);
    }
    findByProject(projectId, user) {
        return this.contractsService.findByProject(projectId, user);
    }
    recordPayment(dto, user) {
        return this.contractsService.recordPayment(dto, user);
    }
    getPayments(contractId, user) {
        return this.contractsService.getPaymentHistory(contractId, user);
    }
    findOne(contractId, user) {
        return this.contractsService.findOne(contractId, user);
    }
    update(contractId, dto, user) {
        return this.contractsService.update(contractId, dto, user);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER, client_1.Role.MANAGER),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contract_dto_1.CreateContractDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER, client_1.Role.MANAGER, client_1.Role.STAKEHOLDER),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER, client_1.Role.MANAGER, client_1.Role.STAKEHOLDER),
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findByProject", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER, client_1.Role.MANAGER),
    (0, common_1.Post)('payments'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [record_contract_payment_dto_1.RecordContractPaymentDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "recordPayment", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER, client_1.Role.MANAGER, client_1.Role.STAKEHOLDER),
    (0, common_1.Get)(':id/payments'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "getPayments", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER, client_1.Role.MANAGER, client_1.Role.STAKEHOLDER),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER, client_1.Role.MANAGER),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_contract_dto_1.UpdateContractDto, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "update", null);
exports.ContractsController = ContractsController = __decorate([
    (0, common_1.Controller)('contracts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map