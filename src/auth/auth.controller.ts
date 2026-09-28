import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignupDto } from './dto/signup.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RolesGuard } from './roles.guard.js';
import { Public } from './decorators/public.decorator.js';
import { Roles } from './decorators/roles.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Role } from './enums/role.enum.js';
import type { ActiveUserData } from './interfaces/jwt-payload.interface.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/signup
   * Public route — creates a new regular user.
   */
  @Public()
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    const user = await this.authService.signup(dto);
    return { success: true, data: user };
  }

  /**
   * POST /auth/login
   * Public route — authenticates user and returns JWT access token.
   */
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const tokens = await this.authService.login(dto);
    return { success: true, data: tokens };
  }

  /**
   * GET /auth/profile
   * Protected route — returns current authenticated user payload.
   */
  @Get('profile')
  getProfile(@CurrentUser() user: ActiveUserData) {
    return { success: true, data: user };
  }

  /**
   * POST /auth/refresh
   * Protected route — rotates tokens for the current user.
   */
  @Post('refresh')
  async refresh(@CurrentUser() user: ActiveUserData) {
    const tokens = await this.authService.refresh(
      user.userId,
      user.email,
      user.role,
    );
    return { success: true, data: tokens };
  }

  /**
   * POST /auth/signup-admin
   * Public route — creates an admin user.
   */
  @Public()
  @Post('signup-admin')
  async signupAdmin(@Body() dto: SignupDto) {
    const user = await this.authService.createAdmin(dto);
    return { success: true, data: user };
  }

  /**
   * GET /auth/admin
   * Protected Admin-only route — requires Role.ADMIN.
   */
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  getAdminDashboard(@CurrentUser() user: ActiveUserData) {
    return {
      success: true,
      data: {
        message: 'Welcome to the admin dashboard!',
        user,
      },
    };
  }
}
