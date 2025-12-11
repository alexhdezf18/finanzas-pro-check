import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // <--- Importar Prisma

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { categoryId, ...rest } = createTransactionDto;

    return this.prisma.transaction.create({
      data: {
        ...rest, // amount, concept, date, type
        user: { connect: { id: 1 } }, // <--- TRUCO TEMPORAL: Hardcodeamos al usuario 1
        category: { connect: { id: categoryId } },
      },
    });
  }

  findAll() {
    return this.prisma.transaction.findMany({
      include: { category: true }, // <--- Traemos el nombre de la categoría, no solo el ID
      orderBy: { date: 'desc' }, // Ordenar por fecha (más reciente primero)
    });
  }

  findOne(id: number) {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return this.prisma.transaction.delete({ where: { id } });
  }
}
