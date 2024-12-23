// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import {PrismaService} from "../../../prisma/prisma.service";
import {JwtPayload} from "./jwt-payload.interface"; // Ensure you have the correct JwtPayload type

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'SECRET_KEY', // Use the same secret as when signing the JWT
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return { id: user.id, email: user.email, role: user.role }; // Add the role to the request object
    }
}
