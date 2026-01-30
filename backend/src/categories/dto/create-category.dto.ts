import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  budgetLimit?: number;
}
