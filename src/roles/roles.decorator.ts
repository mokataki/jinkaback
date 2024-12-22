// src/auth/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { Role } from './role.enum';

// This constant is the key we use to access roles in the RolesGuard
export const ROLES_KEY = 'roles';

// The Roles decorator is used to define which roles are allowed on a route handler
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
