import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RolesGuard } from './roles.guard.js';
import { Public } from './decorators/public.decorator.js';
import { Roles } from './decorators/roles.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/signup
   * Creates a new user with a hashed password.
   * Public — no token required.
   */
  @Public()
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const user = await this.authService.signup(dto);
    return { success: true, data: user };
  }

  /**
   * POST /auth/login
   * Validates credentials and returns a JWT access token.
   * Public — no token required.
   */
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const tokens = await this.authService.login(dto);
    return { success: true, data: tokens };
  }

  /**
   * GET /auth/profile
   * Protected route — returns the current user's data from the JWT payload.
   * No DB call needed; data comes from req.user (set by JwtStrategy.validate()).
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: { userId: string; email: string; role: string } }) {
    return { success: true, data: req.user };
  }

  /**
   * POST /auth/refresh
   * Protected route — issues new access + refresh tokens.
   * Requires a valid JWT to call.
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req: { user: { userId: string; email: string; role: string } }) {
    const { userId, email, role } = req.user;
    const tokens = await this.authService.refresh(userId, email, role);
    return { success: true, data: tokens };
  }

  /**
   * POST /auth/signup-admin
   * Creates an admin user (for demo purposes).
   * Public — no token required.
   */
  @Public()
  @Post('signup-admin')
  async signupAdmin(@Body() dto: SignupDto) {
    const user = await this.authService.createAdmin(dto);
    return { success: true, data: user };
  }

  /**
   * GET /auth/admin
   * Admin-only route — demonstrates @Roles() guard.
   * Requires a valid JWT with role 'admin'.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  getAdminDashboard(@Request() req: { user: { userId: string; email: string; role: string } }) {
    return {
      success: true,
      data: {
        message: 'Welcome to the admin dashboard!',
        user: req.user,
      },
    };
  }
}
