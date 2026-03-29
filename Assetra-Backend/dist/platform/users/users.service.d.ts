import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(params: {
        organizationId: number;
        email: string;
        password: string;
        role: Role;
        fullName: string;
    }): Promise<{
        email: string;
        id: number;
        fullName: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        email: string;
        id: number;
        fullName: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findById(id: number): import(".prisma/client").Prisma.Prisma__UserClient<{
        email: string;
        id: number;
        fullName: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        organizationId: number;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
}
