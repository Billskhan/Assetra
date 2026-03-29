import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
export declare class VendorsController {
    private readonly vendorsService;
    constructor(vendorsService: VendorsService);
    create(dto: CreateVendorDto, user: AuthUser): Promise<{
        email: string | null;
        name: string;
        id: number;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        isGlobal: boolean;
    }>;
    findAll(user: AuthUser): Promise<{
        email: string | null;
        name: string;
        id: number;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        isGlobal: boolean;
    }[]>;
    attachToProject(vendorId: number, projectId: number, user: AuthUser): Promise<{
        id: number;
        createdAt: Date;
        projectId: number;
        vendorId: number;
    }>;
    findByProject(projectId: number, user: AuthUser): Promise<{
        email: string | null;
        name: string;
        id: number;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        isGlobal: boolean;
    }[]>;
}
