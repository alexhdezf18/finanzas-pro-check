import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <--- Importar

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. HABILITAR CORS (La llave de paso)
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
