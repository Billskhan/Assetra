import { Role } from '@prisma/client';
import { Strategy } from 'passport-jwt';
import { AuthUser } from './interfaces/auth-user.interface';
interface JwtPayload {
    sub: number;
    orgId: number;
    role: Role;
    email?: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): AuthUser;
}
export {};
