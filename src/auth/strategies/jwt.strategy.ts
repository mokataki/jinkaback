// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from '@prisma/client';
import {AuthService} from "../auth.service";
import {JwtPayload} from "./jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'SECRET_KEY', // Should use a more secure key
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        // Use the payload (which includes user email, sub, and role) to get the user
        return this.authService.validateUser(payload.email, payload.sub.toString());
    }
}
