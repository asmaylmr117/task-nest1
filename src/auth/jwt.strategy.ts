import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AUTH_CONSTANTS } from './constants/auth.constants.js';
import type { JwtPayload, ActiveUserData } from './interfaces/jwt-payload.interface.js';

/**
 * JwtStrategy extracts the JWT from the Authorization: Bearer <token> header,
 * verifies it against the secret, and returns the decoded payload.
 *
 * The object returned from validate() is attached to request.user
 * by Passport — this is how controllers access the authenticated user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: AUTH_CONSTANTS.JWT_SECRET,
    });
  }

  /**
   * Called automatically after the JWT is verified successfully.
   * The return value becomes `req.user` — available via @CurrentUser() in controllers.
   *
   * @param payload — The decoded JWT payload ({ sub, email, role, iat, exp })
   * @returns ActiveUserData attached to the request
   */
  validate(payload: JwtPayload): ActiveUserData {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
