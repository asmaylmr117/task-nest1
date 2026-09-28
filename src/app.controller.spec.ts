import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('healthCheck', () => {
    it('should return health check data with success: true', () => {
      const result = appController.healthCheck();
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('ok');
      expect(typeof result.data.uptime).toBe('number');
      expect(typeof result.data.timestamp).toBe('string');
    });
  });
});
