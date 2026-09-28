import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role } from './enums/role.enum.js';
import { AUTH_CONSTANTS } from './constants/auth.constants.js';
import {
  USERS_REPOSITORY_TOKEN,
  type IUsersRepository,
} from './repositories/users.repository.js';
import type { SafeUser } from './interfaces/user.interface.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';
import type { SignupDto } from './dto/signup.dto.js';
import type { LoginDto } from './dto/login.dto.js';

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY_TOKEN)
    private readonly usersRepository: IUsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new standard user.
   */
  async signup(dto: SignupDto): Promise<SafeUser> {
    return this.createUser(dto, Role.USER);
  }

  /**
   * Create an admin user.
   */
  async createAdmin(dto: SignupDto): Promise<SafeUser> {
    return this.createUser(dto, Role.ADMIN);
  }

  /**
   * Helper to create a user with specified role and hashed password.
   */
  private async createUser(dto: SignupDto, role: Role): Promise<SafeUser> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      AUTH_CONSTANTS.BCRYPT_SALT_ROUNDS,
    );

    const user = await this.usersRepository.create({
      email: dto.email,
      passwordHash,
      role,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  /**
   * Validate credentials and return a signed JWT access token.
   */
  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }

  /**
   * Issue new access + refresh tokens.
   */
  async refresh(userId: string, email: string, role: Role): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRATION,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRATION,
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
