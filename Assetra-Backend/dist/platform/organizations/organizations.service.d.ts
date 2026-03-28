import { PrismaService } from '../prisma/prisma.service';
export declare class OrganizationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createOrganization(name: string): import(".prisma/client").Prisma.Prisma__OrganizationClient<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
