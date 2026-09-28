import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public — bypasses the JwtAuthGuard.
 * Without this decorator, all routes require a valid JWT when
 * JwtAuthGuard is registered globally.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
