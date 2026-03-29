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
let ProjectAccessGuard = class ProjectAccessGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            return false;
        }
        const projectId = Number(request.params.projectId);
        if (!Number.isFinite(projectId)) {
            throw new common_1.NotFoundException('Project not found');
        }
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                organizationId: user.organizationId
            },
            include: {
                projectUsers: {
                    select: { userId: true }
                }
            }
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (user.role === client_1.Role.ADMIN || user.role === client_1.Role.PROJECT_MANAGER) {
            return true;
        }
        if (user.role === client_1.Role.MANAGER || user.role === client_1.Role.STAKEHOLDER) {
            const assigned = project.projectUsers.some((projectUser) => projectUser.userId === user.userId);
            if (!assigned) {
                throw new common_1.ForbiddenException('Project access denied');
            }
            return true;
        }
        throw new common_1.ForbiddenException('Project access denied');
    }
};
exports.ProjectAccessGuard = ProjectAccessGuard;
exports.ProjectAccessGuard = ProjectAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectAccessGuard);
//# sourceMappingURL=project-access.guard.js.map