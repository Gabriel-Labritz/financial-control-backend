import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { TransactionCategory } from 'src/common/enum/transaction-category.enum';
import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { PaginationQueryDto } from './pagination-query.dto';

export class FilterByMonthDto extends PaginationQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'O mês deve ser um número inteiro.' })
  @IsPositive({ message: 'O mês deve ser um número positivo.' })
  @Min(1, { message: 'O mês deve ser estar 1 a 12.' })
  @Max(12, { message: 'O mês deve ser estar 1 a 12.' })
  month: number;

  @Type(() => Number)
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @IsPositive({ message: 'O ano deve ser um número positivo.' })
  @Min(2025, { message: 'Ano mínimo permitido: 2025.' })
  year: number;

  @IsOptional()
  @IsEnum(TransactionType, {
    message: 'Tipo da transação inválida.',
  })
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionCategory, { message: 'Categoria de transação inválida.' })
  category?: TransactionCategory;
}
