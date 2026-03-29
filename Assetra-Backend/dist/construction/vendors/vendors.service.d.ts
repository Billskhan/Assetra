import { PrismaService } from '../../platform/prisma/prisma.service';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { Vendor } from '@prisma/client';
export declare class VendorsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateVendorDto, user: AuthUser): Promise<Vendor>;
    findAll(user: AuthUser): Promise<Vendor[]>;
    attachToProject(vendorId: number, projectId: number, user: AuthUser): Promise<{
        id: number;
        createdAt: Date;
        projectId: number;
        vendorId: number;
    }>;
    findByProject(projectId: number, user: AuthUser): Promise<Vendor[]>;
}
