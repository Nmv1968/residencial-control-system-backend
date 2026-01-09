import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors();

  // Security Headers
  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Global Exception Filters
  app.useGlobalFilters(new MongoExceptionFilter());

  // Global Access Control: GET Public, Others Protected
  // Note: We need to register this guard either globally here (if it doesn't need DI)
  // or in AppModule providers. Since it extends AuthGuard('jwt'), it needs the Strategy.
  // Best practice for simpler setup with DI: Register in AppModule.
  // For this step, I will register it in AppModule to ensure DI works for AuthGuard.

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Residential Control System API')
    .setDescription('API for managing housing, owners, periods, and movements.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
