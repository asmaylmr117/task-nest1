import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum.js';

export const ROLES_KEY = 'roles';

/**
 * Marks a route as requiring specific roles.
 * Used in combination with the RolesGuard.
 *
 * @example @Roles(Role.ADMIN)
 */
export const Roles = (...roles: (Role | string)[]) => SetMetadata(ROLES_KEY, roles);
