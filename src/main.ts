import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set Global Prefix for API
  app.setGlobalPrefix('');
  app.use(cookieParser());

  // Enable CORS
  app.enableCors();

  // Apply Global Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform:true , forbidNonWhitelisted: true }));

  await app.listen(process.env.PORT ?? 8888);
}
bootstrap();
