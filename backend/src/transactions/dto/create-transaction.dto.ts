import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
// Un truco: Aunque en Prisma definimos el Enum, aquí lo redefinimos o lo importamos
// Para simplificar por hoy, usaremos strings validados.

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive() // No permitimos gastos negativos ni cero
  amount: number;

  @IsString()
  @IsNotEmpty()
  concept: string; // Ej: "Hamburguesa"

  @IsDateString()
  date: string; // Esperamos formato ISO: "2025-04-02T10:00:00Z"

  @IsEnum(['INCOME', 'EXPENSE'])
  type: 'INCOME' | 'EXPENSE';

  @IsNumber()
  categoryId: number; // El ID de la categoría (Ej: 3 para Comida)
}
