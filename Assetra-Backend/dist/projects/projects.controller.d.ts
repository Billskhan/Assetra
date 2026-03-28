import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(dto: CreateProjectDto): Promise<{
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
    findAll(): Promise<{
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
    findOne(id: number): Promise<{
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
    update(id: number, dto: UpdateProjectDto): Promise<{
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
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
