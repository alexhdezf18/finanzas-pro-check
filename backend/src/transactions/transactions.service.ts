import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // <--- Importar Prisma

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const userId = 1; // Hardcodeado por ahora

    try {
      return await this.prisma.transaction.create({
        data: {
          amount: createTransactionDto.amount,
          concept: createTransactionDto.concept,
          date: new Date(createTransactionDto.date), // Conversión importante
          type: createTransactionDto.type,
          categoryId: createTransactionDto.categoryId,
          userId: userId,
        },
      });
    } catch (error) {
      // Manejamos el error P2003 específicamente
      if (error.code === 'P2003') {
        throw new NotFoundException(
          `No se pudo crear la transacción: La categoría (ID ${createTransactionDto.categoryId}) o el usuario no existen.`,
        );
      }

      // Si es otro error, que lo lance normal
      throw error;
    }
  }

  findAll() {
    const userId = 1;
    return this.prisma.transaction.findMany({
      where: { userId },
      include: { category: true }, // ¡Truco! Traemos el nombre de la categoría de una vez
      orderBy: { date: 'desc' }, // Las más recientes primero
    });
  }

  findOne(id: number) {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    const userId = 1; // Hardcodeado

    // 1. Verificar que la transacción exista y sea de este usuario
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) throw new NotFoundException('Transacción no encontrada');

    // 2. Si vienen fechas, asegúrate de convertirlas a objeto Date
    const dataToUpdate: any = { ...updateTransactionDto };
    if (dataToUpdate.date) {
      dataToUpdate.date = new Date(dataToUpdate.date);
    }

    // 3. Actualizar
    return this.prisma.transaction.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: number) {
    const userId = 1;
    // Verificar que sea de este usuario antes de borrar
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!transaction) throw new NotFoundException('Transacción no encontrada');

    return this.prisma.transaction.delete({ where: { id } });
  }
}
