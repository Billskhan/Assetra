import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { AttachVendorToProjectDto } from './dto/attach-vendor-to-project.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { VendorsService } from './vendors.service';
export declare class VendorsController {
    private vendorsService;
    constructor(vendorsService: VendorsService);
    create(user: AuthUser, dto: CreateVendorDto): Promise<{
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        phone: string | null;
        isGlobal: boolean;
    }>;
    findAll(user: AuthUser, projectId?: string): Promise<{
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        phone: string | null;
        isGlobal: boolean;
    }[]>;
    findOne(user: AuthUser, vendorId: number): Promise<{
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        projectVendors: {
            projectId: number;
        }[];
        phone: string | null;
        isGlobal: boolean;
    }>;
    attachToProject(user: AuthUser, vendorId: number, projectId: number, _dto: AttachVendorToProjectDto): Promise<{
        projectId: number;
        vendorId: number;
    }>;
}
