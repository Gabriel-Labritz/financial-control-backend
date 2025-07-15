import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';
import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { TransactionCategory } from 'src/common/enum/transaction-category.enum';

export class FilterTransactionDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(TransactionType, { message: 'Tipo de transação inválido.' })
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionCategory, { message: 'Categoria de transação inválida.' })
  category?: TransactionCategory;
}
