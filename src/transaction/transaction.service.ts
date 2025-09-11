import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { TokenPayloadDto } from 'src/auth/dto/token_payload.dto';
import { CreateTransactionDto } from './dto/create_transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entity/Transaction';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { responseTransactionsSuccessMessages } from '../common/enums/success/success_transactions/response_transactions_success_messages.enum';
import { responseTransactionsErrorsMessage } from '../common/enums/erros/errors_transactions/response_transactions_errors_message.enum';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly userService: UserService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const { title, amount, type, category, description } = createTransactionDto;

    try {
      const newTransaction = this.transactionRepository.create({
        title,
        amount,
        type,
        category,
        description,
        user: { id: tokenPayload.id },
      });
      await this.transactionRepository.save(newTransaction);

      return {
        message: responseTransactionsSuccessMessages.TRANSACTION_CREATED,
        newTransaction,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseTransactionsErrorsMessage.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
