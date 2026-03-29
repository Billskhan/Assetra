import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AssignProjectUserDto } from './dto/assign-project-user.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
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
}
