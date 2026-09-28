import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { SignupDto } from './dto/signup.dto.js';
import type { LoginDto } from './dto/login.dto.js';

/** In-memory user record — password hash is stored, never the raw password */
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

/**
 * AuthService handles user creation, credential verification, and JWT signing.
 *
 * Uses an in-memory array as a simple data store — swap this out for a real
 * database (TypeORM, Prisma, etc.) in production.
 */
@Injectable()
export class AuthService {
  /** In-memory user store */
  private readonly users: User[] = [];
  private nextId = 1;

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Register a new user.
   * - Checks for duplicate email
   * - Hashes the password with bcrypt (10 salt rounds)
   * - Returns user data WITHOUT the password
   */
  async signup(dto: SignupDto) {
    // Check for existing user
    const existing = this.users.find((u) => u.email === dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Create user record
    const user: User = {
      id: String(this.nextId++),
      email: dto.email,
      passwordHash,
      role: 'user', // default role
      createdAt: new Date(),
    };

    this.users.push(user);

    // Return user without password hash
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  /**
   * Validate credentials and return a signed JWT.
   * The token payload contains { sub: userId, email, role }.
   */
  async login(dto: LoginDto) {
    const user = this.users.find((u) => u.email === dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // JWT payload — this is what JwtStrategy.validate() receives
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Issue new access + refresh tokens.
   * In a real app you'd store the refresh token in a DB and invalidate on logout.
   */
  async refresh(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  /**
   * Create an admin user (for demo/testing purposes).
   */
  async createAdmin(dto: SignupDto) {
    const existing = this.users.find((u) => u.email === dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user: User = {
      id: String(this.nextId++),
      email: dto.email,
      passwordHash,
      role: 'admin',
      createdAt: new Date(),
    };

    this.users.push(user);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
