import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
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

  async findOne(id: number) {
    const userId = 1; // Hardcoded temporalmente

    const category = await this.prisma.category.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!category) {
      // Si no existe o no es de este usuario, lanzamos error 404
      throw new NotFoundException(`La categoría #${id} no se encontró`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Primero verificamos que la categoría exista y pertenezca al usuario
    await this.findOne(id);

    // Si pasa la verificación, actualizamos
    return this.prisma.category.update({
      where: { id: id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    // Primero verificamos que la categoría exista y pertenezca al usuario
    await this.findOne(id);

    // OJO: Esto fallará si la categoría ya tiene transacciones asociadas
    // (Por la llave foránea en la base de datos).
    // Para el MVP está bien, luego podemos manejar ese error.
    return this.prisma.category.delete({
      where: { id: id },
    });
  }
}
