import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { HttpExceptionFilter } from './auth/filters/http-exception.filter.js';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [
    // Register JwtAuthGuard globally — ALL routes require a JWT
    // unless explicitly marked with @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Register the global exception filter for consistent error responses
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
