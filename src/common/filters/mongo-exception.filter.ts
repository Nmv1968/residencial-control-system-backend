import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { MongoError, MongoServerError } from 'mongodb';

@Catch(MongoError, MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError | MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Catch Duplicate Key Error (E11000)
    if (exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate key error: Resource already exists';
      error = 'Conflict';

      // Try to parse the key pattern to be more specific
      // The error message is usually like: "E11000 duplicate key error collection: ... index: number_1 dup key: { number: "A-1" }"
      const keyPattern = (exception as any).keyPattern;
      const keyValue = (exception as any).keyValue;

      if (keyPattern && keyValue) {
        const field = Object.keys(keyPattern)[0];
        const value = keyValue[field];
        message = `Duplicate value '${value}' for field '${field}'.`;
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }
}
