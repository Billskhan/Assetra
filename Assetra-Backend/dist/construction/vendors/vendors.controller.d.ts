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
    attachToProjectLegacy(vendorId: number, projectId: number, user: AuthUser): Promise<{
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
    getOutstandingSummary(user: AuthUser): Promise<{
        vendorId: number;
        vendorName: string;
        totalTransactionAmount: number;
        totalPaidAmount: number;
        totalBalance: number;
    }[]>;
}
