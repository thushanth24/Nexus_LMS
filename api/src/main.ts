import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend applications
  app.enableCors({
    origin: '*', // In production, restrict this to your frontend domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Apply global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that do not have any decorators
    transform: true, // Automatically transform payloads to DTO instances
  }));
  
  await app.listen(3000);
}
bootstrap();
