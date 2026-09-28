import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { ActiveUserData } from '../interfaces/jwt-payload.interface.js';

/**
 * Custom parameter decorator to extract the authenticated user from the Request.
 * Can extract the whole user object or a specific property (e.g. `@CurrentUser('userId') id: string`).
 */
export const CurrentUser = createParamDecorator(
  (data: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as ActiveUserData | undefined;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
