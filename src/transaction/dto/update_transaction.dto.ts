import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create_transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
