import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API prefix
  app.setGlobalPrefix('api');

  // Middleware
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // CORS configuration
  app.enableCors({
    // origin: [
    //   'http://185.98.137.109:5173', // Keep for now (local test)
    //   'https://khlassyculture.com', // Your real frontend domain (important!)
    // ],
    origin: 'https://khlassyculture.com', // Your real frontend domain (important!)

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Start the server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`NestJS server running on http://localhost:${port}/api`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
