import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './auth/decorators/public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
      data: this.appService.getHealth(),
    };
  }
}
