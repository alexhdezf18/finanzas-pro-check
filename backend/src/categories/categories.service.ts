import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  // Inyectamos Prisma en el constructor
  constructor(private prisma: PrismaService) {}

  create(createCategoryDto: any) {
    return 'This action adds a new category';
  }

  // Buscar todas las categorías
  findAll() {
    return this.prisma.category.findMany();
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
