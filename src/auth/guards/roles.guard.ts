// src/auth/guards/roles.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {ROLES_KEY} from "../../roles/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.get<string[]>(
            ROLES_KEY,
            context.getHandler(),
        );
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('User not found');
        }

        // Check if the user has the required role
        const hasRole = requiredRoles.some((role) => user.role.includes(role));
        if (!hasRole) {
            throw new ForbiddenException('Access denied');
        }

        return true;
    }
}
