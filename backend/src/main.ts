import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <--- Importar

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activar las validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina datos extra que no estén en el DTO (Seguridad)
      forbidNonWhitelisted: true, // Lanza error si envían basura extra
    }),
  );

  await app.listen(3000);
}
bootstrap();
