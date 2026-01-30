import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsPositive,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  concept: string;

  @IsDateString() // Valida formato ISO-8601 (ej: "2026-01-30T10:00:00Z")
  date: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  categoryId: number;
}
