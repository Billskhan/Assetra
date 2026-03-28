import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateVendorDto } from './dto/create-vendor.dto';
export declare class VendorsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateVendorDto, user: AuthUser): Promise<{
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        phone: string | null;
        isGlobal: boolean;
    }>;
    findAll(user: AuthUser, projectId?: number): Promise<{
        email: string | null;
        name: string;
        id: number;
        createdAt: Date;
        phone: string | null;
        isGlobal: boolean;
    }[]>;
    findOne(vendorId: number, user: AuthUser): Promise<{
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
    attachToProject(vendorId: number, projectId: number, user: AuthUser): Promise<{
        projectId: number;
        vendorId: number;
    }>;
}
