import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  USERS_REPOSITORY_TOKEN,
  InMemoryUsersRepository,
} from './repositories/users.repository.js';
import { Role } from './enums/role.enum.js';
import { AUTH_CONSTANTS } from './constants/auth.constants.js';

describe('AuthService', () => {
  let service: AuthService;
  let repo: InMemoryUsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: AUTH_CONSTANTS.JWT_SECRET,
          signOptions: { expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRATION },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: USERS_REPOSITORY_TOKEN,
          useClass: InMemoryUsersRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repo = module.get<InMemoryUsersRepository>(USERS_REPOSITORY_TOKEN);
    await repo.clear();
  });

  describe('signup', () => {
    it('should register a new user and return safe user data without password hash', async () => {
      const user = await service.signup({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(user).toBeDefined();
      expect(user.id).toBe('1');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe(Role.USER);
      expect((user as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should throw ConflictException on duplicate email', async () => {
      await service.signup({
        email: 'test@example.com',
        password: 'password123',
      });

      await expect(
        service.signup({
          email: 'test@example.com',
          password: 'password456',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createAdmin', () => {
    it('should register an admin user with Role.ADMIN', async () => {
      const admin = await service.createAdmin({
        email: 'admin@example.com',
        password: 'adminpassword',
      });

      expect(admin.role).toBe(Role.ADMIN);
      expect(admin.email).toBe('admin@example.com');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await service.signup({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return access_token when credentials are valid', async () => {
      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.access_token).toBeDefined();
      expect(typeof result.access_token).toBe('string');
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when email not found', async () => {
      await expect(
        service.login({
          email: 'unknown@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should generate both access_token and refresh_token', async () => {
      const tokens = await service.refresh('1', 'test@example.com', Role.USER);
      expect(tokens.access_token).toBeDefined();
      expect(tokens.refresh_token).toBeDefined();
      expect(typeof tokens.access_token).toBe('string');
      expect(typeof tokens.refresh_token).toBe('string');
    });
  });
});
