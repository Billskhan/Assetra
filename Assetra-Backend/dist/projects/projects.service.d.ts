import { PrismaService } from '../platform/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createProject(dto: CreateProjectDto): Promise<{
        id: number;
        name: string;
        description: string | null;
        location: string | null;
        startDate: Date | null;
        endDate: Date | null;
        budget: number | null;
        organizationId: number;
        createdById: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getProjects(): Promise<{
        id: number;
        name: string;
        description: string | null;
        location: string | null;
        startDate: Date | null;
        endDate: Date | null;
        budget: number | null;
        organizationId: number;
        createdById: number | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getProjectById(id: number): Promise<{
        id: number;
        name: string;
        description: string | null;
        location: string | null;
        startDate: Date | null;
        endDate: Date | null;
        budget: number | null;
        organizationId: number;
        createdById: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProject(id: number, dto: UpdateProjectDto): Promise<{
        id: number;
        name: string;
        description: string | null;
        location: string | null;
        startDate: Date | null;
        endDate: Date | null;
        budget: number | null;
        organizationId: number;
        createdById: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteProject(id: number): Promise<{
        success: boolean;
    }>;
    private parseRequiredId;
    private parseOptionalId;
    private mapProject;
}
