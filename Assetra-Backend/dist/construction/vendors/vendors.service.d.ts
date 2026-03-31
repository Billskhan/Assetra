import { PrismaService } from '../../platform/prisma/prisma.service';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { Vendor } from '@prisma/client';
type VendorOutstandingSummary = {
    vendorId: number;
    vendorName: string;
    totalTransactionAmount: number;
    totalPaidAmount: number;
    totalBalance: number;
};
export declare class VendorsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateVendorDto, user: AuthUser): Promise<Vendor>;
    findAll(user: AuthUser): Promise<Vendor[]>;
    attachToProject(vendorId: number, projectId: number, user: AuthUser): Promise<{
        success: boolean;
        alreadyAttached: boolean;
        attachment: {
            id: number;
            createdAt: Date;
        };
        project: {
            name: string;
            id: number;
            organizationId: number;
        };
        vendor: {
            name: string;
            id: number;
            organizationId: number;
        };
    } | {
        success: boolean;
        alreadyAttached: boolean;
        project: {
            name: string;
            id: number;
            organizationId: number;
        };
        vendor: {
            name: string;
            id: number;
            organizationId: number;
        };
        attachment?: undefined;
    }>;
    findByProject(projectId: number, user: AuthUser): Promise<Vendor[]>;
    getOutstandingSummary(user: AuthUser): Promise<VendorOutstandingSummary[]>;
}
export {};
