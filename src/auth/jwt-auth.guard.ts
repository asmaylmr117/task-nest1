import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './decorators/public.decorator.js';

/**
 * JwtAuthGuard extends Passport's built-in AuthGuard for the 'jwt' strategy.
 *
 * It checks for the @Public() decorator metadata before enforcing
 * authentication — routes marked @Public() skip token validation entirely.
 *
 * When registered globally (APP_GUARD), every route requires a JWT
 * unless explicitly marked with @Public().
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route or its controller class has @Public() metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip JWT validation for public routes
    }

    // Delegate to Passport's AuthGuard to validate the JWT
    return super.canActivate(context);
  }
}
