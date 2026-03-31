import { PrismaService } from '../../platform/prisma/prisma.service';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateProjectDto } from './dto/create-project.dto';
import { AssignProjectUserDto } from './dto/assign-project-user.dto';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProjectDto, user: AuthUser): Promise<{
        id: number;
        name: string;
        description: string | null;
        budget: number | null;
        organizationId: number;
        createdById: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(user: AuthUser): Promise<{
        id: number;
        name: string;
        description: string | null;
        budget: number | null;
        organizationId: number;
        createdById: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(projectId: number, user: AuthUser): Promise<{
        vendors: {
            id: number;
            name: string;
            email: string | null;
            phone: string | null;
            isGlobal: boolean;
            createdAt: Date;
        }[];
        id: number;
        name: string;
        description: string | null;
        budget: number | null;
        organizationId: number;
        createdById: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignUser(projectId: number, dto: AssignProjectUserDto, user: AuthUser): Promise<{
        id: number;
        userId: number;
        projectRole: import(".prisma/client").$Enums.ProjectRole;
        projectId: number;
        assignedAt: Date;
    }>;
    private isAdminOrPm;
    private isManagerOrStakeholder;
    private ensureCanManageProjects;
    private mapProject;
    private mapProjectVendors;
}
