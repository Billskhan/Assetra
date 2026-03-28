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
exports.ProjectAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../../platform/prisma/prisma.service");
const roles_1 = require("../../../common/roles");
let ProjectAccessGuard = class ProjectAccessGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const projectId = Number(request.params?.projectId);
        if (!user || !Number.isInteger(projectId)) {
            throw new common_1.NotFoundException('Project not found.');
        }
        if (user.role === client_1.Role.VENDOR) {
            throw new common_1.ForbiddenException('Project access denied.');
        }
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, organizationId: user.organizationId }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found.');
        }
        if (roles_1.ADMIN_ROLES.includes(user.role)) {
            return true;
        }
        const assignment = await this.prisma.projectUser.findFirst({
            where: { projectId, userId: user.userId, organizationId: user.organizationId }
        });
        if (!assignment) {
            throw new common_1.ForbiddenException('Project access denied.');
        }
        return true;
    }
};
exports.ProjectAccessGuard = ProjectAccessGuard;
exports.ProjectAccessGuard = ProjectAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectAccessGuard);
//# sourceMappingURL=project-access.guard.js.map