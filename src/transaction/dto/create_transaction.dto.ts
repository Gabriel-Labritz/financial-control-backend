import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { TransactionCategories } from '../../common/enums/transaction/transaction_categories.enum';
import { TransactionTypes } from '../../common/enums/transaction/transaction_types.enum';

export class CreateTransactionDto {
  @IsString({ message: 'O títule deve ser uma string.' })
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @MaxLength(50, { message: 'O título deve conter no máximo 50 caracteres.' })
  title: string;

  @IsNumber({}, { message: 'O valor deve ser um número.' })
  @IsNotEmpty({ message: 'O valor é obrigatório.' })
  @IsPositive({ message: 'O valor deve ser positivo.' })
  amount: number;

  @IsEnum(TransactionTypes, {
    message: 'Informe o tipo da transação (renda ou despensa).',
  })
  type: TransactionTypes;

  @IsEnum(TransactionCategories, {
    message:
      'Informe a categoria da transação (saúde, alimentação, transporte, entreterimento, salário ou outro).',
  })
  category: TransactionCategories;

  @IsString()
  @IsOptional()
  @MaxLength(150, {
    message: 'A descrição da transação deve conter no máximo 150 caracteres.',
  })
  description: string;
}
