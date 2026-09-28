import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

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
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    });
  }

  /**
   * Called automatically after the JWT is verified successfully.
   * The return value becomes `req.user` — available via @Request() in controllers.
   *
   * @param payload — The decoded JWT payload ({ sub, email, role, iat, exp })
   * @returns The user object attached to the request
   */
  validate(payload: { sub: string; email: string; role: string }) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
