import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { AUTH_CONSTANTS } from './constants/auth.constants.js';
import {
  USERS_REPOSITORY_TOKEN,
  InMemoryUsersRepository,
} from './repositories/users.repository.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: AUTH_CONSTANTS.JWT_SECRET,
      signOptions: { expiresIn: AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRATION },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: USERS_REPOSITORY_TOKEN,
      useClass: InMemoryUsersRepository,
    },
  ],
  exports: [AuthService, USERS_REPOSITORY_TOKEN],
})
export class AuthModule {}
