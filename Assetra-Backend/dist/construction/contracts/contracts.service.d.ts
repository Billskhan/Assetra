import { Contract } from '@prisma/client';
import { PrismaService } from '../../platform/prisma/prisma.service';
import type { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { CreateContractDto } from './dto/create-contract.dto';
export declare class ContractsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateContractDto, user: AuthUser): Promise<Contract>;
    findAll(user: AuthUser): Promise<Contract[]>;
    findByProject(projectId: number, user: AuthUser): Promise<Contract[]>;
    approve(contractId: number, user: AuthUser): Promise<Contract>;
}
