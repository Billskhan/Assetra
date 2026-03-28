import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  createOrganization(name: string) {
    return this.prisma.organization.create({
      data: { name }
    });
  }
}
