import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from './interfaces/auth-user.interface';

interface JwtPayload {
  sub: number;
  orgId: number;
  role: Role;
  email?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'assetra-secret'
    });
  }

  validate(payload: JwtPayload): AuthUser {
    if (!payload?.sub || !payload?.orgId || !payload?.role) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      userId: payload.sub,
      organizationId: payload.orgId,
      role: payload.role,
      email: payload.email
    };
  }
}
