import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { AssignProjectUserDto } from './dto/assign-project-user.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    create(user: AuthUser, dto: CreateProjectDto): Promise<{
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
    findOne(user: AuthUser, projectId: number): Promise<{
        id: number;
        organizationId: number;
        name: string;
        description: string | null;
        budget: number;
        createdById: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignUser(user: AuthUser, projectId: number, dto: AssignProjectUserDto): Promise<{
        role: import(".prisma/client").$Enums.ProjectRole;
        projectId: number;
        userId: number;
    }>;
}
