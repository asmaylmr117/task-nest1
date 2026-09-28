import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator.js';

@Controller()
export class AppController {
  /**
   * GET /health
   * Public route — always accessible, no token required.
   * Returns basic health check info.
   */
  @Public()
  @Get('health')
  healthCheck() {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  }
}
