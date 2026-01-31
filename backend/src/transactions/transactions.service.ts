import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // <--- Importar Prisma

// ... imports

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // Recibe userId como argumento
  async create(createTransactionDto: CreateTransactionDto, userId: number) {
    try {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: createTransactionDto.categoryId },
      });

      if (!categoryExists)
        throw new NotFoundException('Categoría no encontrada');

      return await this.prisma.transaction.create({
        data: {
          ...createTransactionDto,
          date: new Date(createTransactionDto.date),
          userId: userId, // 🔥 Usamos el ID real
        },
      });
    } catch (error) {
      if (error.code === 'P2003') throw new NotFoundException('Error de FK');
      throw error;
    }
  }

  findAll(userId: number) {
    return this.prisma.transaction.findMany({
      where: { userId }, // 🔥 Filtra solo TUS transacciones
      include: { category: true },
      orderBy: { date: 'desc' },
    });
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    userId: number,
  ) {
    // Validar propiedad
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!transaction) throw new NotFoundException('Transacción no encontrada');

    // ... lógica de update (igual que antes pero pasando userId si es necesario)
    const dataToUpdate: any = { ...updateTransactionDto };
    if (dataToUpdate.date) dataToUpdate.date = new Date(dataToUpdate.date);

    return this.prisma.transaction.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: number, userId: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!transaction) throw new NotFoundException('Transacción no encontrada');

    return this.prisma.transaction.delete({ where: { id } });
  }
}
