import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(params: {
    organizationId: number;
    email: string;
    password: string;
    role: Role;
    name?: string;
  }) {
    const passwordHash = await bcrypt.hash(params.password, 10);

    return this.prisma.user.create({
      data: {
        organizationId: params.organizationId,
        email: params.email,
        passwordHash,
        role: params.role,
        name: params.name
      }
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }
}
