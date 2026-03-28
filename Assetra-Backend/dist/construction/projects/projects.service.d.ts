import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateProjectDto } from './dto/create-project.dto';
import { AssignProjectUserDto } from './dto/assign-project-user.dto';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProjectDto, user: AuthUser): Promise<{
        id: number;
        organizationId: number;
        name: string;
        description: string | null;
        budget: number;
        createdById: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(user: AuthUser): Promise<{
        id: number;
        organizationId: number;
        name: string;
        description: string | null;
        budget: number;
        createdById: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(projectId: number, user: AuthUser): Promise<{
        id: number;
        organizationId: number;
        name: string;
        description: string | null;
        budget: number;
        createdById: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignUser(projectId: number, dto: AssignProjectUserDto, user: AuthUser): Promise<{
        role: import(".prisma/client").$Enums.ProjectRole;
        projectId: number;
        userId: number;
    }>;
    private mapProject;
}
