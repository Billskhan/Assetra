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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../platform/prisma/prisma.service");
let GovernanceService = class GovernanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByProject(projectId, user) {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                organizationId: user.organizationId
            }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return this.prisma.projectGovernance.findUnique({
            where: { projectId }
        });
    }
    async upsertByProject(projectId, dto, user) {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                organizationId: user.organizationId
            }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return this.prisma.projectGovernance.upsert({
            where: { projectId },
            update: {
                requireContractApproval: dto.requireContractApproval,
                requirePaymentApproval: dto.requirePaymentApproval,
                requireTxApproval: dto.requireTxApproval
            },
            create: {
                projectId,
                requireContractApproval: dto.requireContractApproval,
                requirePaymentApproval: dto.requirePaymentApproval,
                requireTxApproval: dto.requireTxApproval
            }
        });
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map