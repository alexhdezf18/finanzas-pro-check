import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  // Inyectamos Prisma en el constructor
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // 1. Hardcodeamos el userId por ahora (según tu estrategia actual sin Auth)
    const userId = 1;

    try {
      return await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          icon: createCategoryDto.icon,
          userId: userId,
        },
      });
    } catch (error) {
      // 2. Manejo de error si intentan crear una categoría duplicada
      // El código P2002 es de Prisma para "Unique constraint failed"
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `La categoría '${createCategoryDto.name}' ya existe para este usuario.`,
          );
        }
      }
      throw error; // Si es otro error, que reviente (o manéjalo globalmente)
    }
  }

  // Buscar todas las categorías
  findAll() {
    return this.prisma.category.findMany({
      where: { userId: 1 },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: any) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
