import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Marks a route as requiring specific roles.
 * Used in combination with the RolesGuard.
 *
 * @example @Roles('admin')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
