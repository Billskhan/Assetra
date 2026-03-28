import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const SALT_ROUNDS = 10;

interface JwtPayload {
  sub: number;
  orgId: number;
  role: Role;
  email?: string;
}

export interface AuthResponse {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (existing) {
      throw new ConflictException('Email already registered.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: dto.organizationName }
      });

      return tx.user.create({
        data: {
          organizationId: organization.id,
          email: dto.email,
          passwordHash,
          role: Role.ADMIN,
          name: dto.name
        }
      });
    });

    const payload: JwtPayload = {
      sub: user.id,
      orgId: user.organizationId,
      role: user.role,
      email: user.email
    };

    return this.signToken(payload);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      orgId: user.organizationId,
      role: user.role,
      email: user.email
    };

    return this.signToken(payload);
  }

  signToken(payload: JwtPayload): AuthResponse {
    return { access_token: this.jwtService.sign(payload) };
  }
}
