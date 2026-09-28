import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Global exception filter that ensures ALL error responses have a
 * consistent shape: { success: false, statusCode, message, timestamp, path }.
 *
 * Handles both HttpException (NestJS errors) and unexpected errors.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // class-validator returns { message: string[] } — flatten it
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = Array.isArray(resp.message)
          ? resp.message.join('; ')
          : (resp.message as string) || exception.message;
      } else {
        message = exceptionResponse as string;
      }
    } else {
      // Log unexpected 500 errors
      this.logger.error(
        `Unexpected error occurred on [${request?.method}] ${request?.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  }
}
