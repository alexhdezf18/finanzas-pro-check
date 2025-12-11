import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // <--- Exportamos para que otros lo usen
})
export class PrismaModule {}
