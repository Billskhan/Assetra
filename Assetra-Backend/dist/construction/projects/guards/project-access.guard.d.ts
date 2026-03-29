import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../../platform/prisma/prisma.service';
export declare class ProjectAccessGuard implements CanActivate {
    private readonly prisma;
    constructor(prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
