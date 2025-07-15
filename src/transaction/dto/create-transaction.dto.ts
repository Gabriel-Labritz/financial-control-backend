import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { TransactionCategory } from 'src/common/enum/transaction-category.enum';
import { TransactionType } from 'src/common/enum/transaction-type.enum';

export class CreateTransactionDto {
  @IsString({ message: 'O título deve ser uma string.' })
  @IsNotEmpty({ message: 'O título da transação é obrigatório.' })
  @MaxLength(50, {
    message: 'O título da transação deve possuir no máximo 50 caracteres.',
  })
  title: string;

  @IsNumber({}, { message: 'O valor da quantia deve ser um número válido.' })
  @IsNotEmpty({ message: 'O valor da quantia é obrigatório.' })
  @IsPositive({ message: 'O valor da quantia deve ser um valor positivo.' })
  amount: number;

  @IsEnum(TransactionType, {
    message: 'Informe o tipo da transação: (renda ou despesa)',
  })
  type: TransactionType;

  @IsEnum(TransactionCategory, {
    message:
      'Informe a categoria da transação: (alimentação, transporte, saúde, entreterimento, salário ou outro).',
  })
  category: TransactionCategory;

  @IsString({ message: 'A descrição deve ser uma string.' })
  @IsOptional()
  @MaxLength(255, { message: 'A descrição deve ter no máximo 255 caracteres.' })
  description?: string;
}
