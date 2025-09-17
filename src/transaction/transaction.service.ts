import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TokenPayloadDto } from 'src/auth/dto/token_payload.dto';
import { CreateTransactionDto } from './dto/create_transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entity/Transaction';
import { Repository } from 'typeorm';
import { responseTransactionsSuccessMessages } from '../common/enums/success/success_transactions/response_transactions_success_messages.enum';
import { responseTransactionsErrorsMessage } from '../common/enums/erros/errors_transactions/response_transactions_errors_message.enum';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateTransactionDto } from './dto/update_transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
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

  async findAll(pagination: PaginationDto, tokenPayload: TokenPayloadDto) {
    const { limit = 10, page = 1 } = pagination;

    try {
      const [userTransactions, totalItems] =
        await this.transactionRepository.findAndCount({
          where: { user: { id: tokenPayload.id } },
          select: [
            'id',
            'title',
            'amount',
            'type',
            'category',
            'description',
            'createdAt',
          ],
          order: { createdAt: 'DESC' },
          take: limit,
          skip: (page - 1) * limit,
        });

      return {
        message: responseTransactionsSuccessMessages.TRANSACTIONS_LOADED,
        userTransactions,
        pagination: {
          current_page: page,
          items_per_page: limit,
          totalItems,
          total_pages: Math.ceil(totalItems / limit),
        },
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseTransactionsErrorsMessage.LOAD_TRANSACTION_ERROR,
      );
    }
  }

  async findOne(id: string, tokenPayload: TokenPayloadDto) {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { id, user: { id: tokenPayload.id } },
      });

      if (!transaction) {
        throw new NotFoundException(
          responseTransactionsErrorsMessage.TRANSACTION_NOT_FOUND,
        );
      }

      return {
        message: responseTransactionsSuccessMessages.TRANSACTION_LOADED,
        transaction,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseTransactionsErrorsMessage.ERROR_LOAD_TRANSACTION,
      );
    }
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    tokenPayload: TokenPayloadDto,
  ) {
    try {
      if (Object.keys(updateTransactionDto).length === 0) {
        throw new BadRequestException(
          responseTransactionsErrorsMessage.ERROR_TRANSACTION_UPDATE_EMPTY,
        );
      }

      const { transaction } = await this.findOne(id, tokenPayload);
      const transactionUpdated = Object.assign(
        transaction,
        updateTransactionDto,
      );

      await this.transactionRepository.save(transactionUpdated);

      return {
        message: responseTransactionsSuccessMessages.TRANSACTION_UPDATED,
        transaction: transactionUpdated,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseTransactionsErrorsMessage.ERROR_TRANSACTION_UPDATE,
      );
    }
  }

  async remove(id: string, tokenPayload: TokenPayloadDto) {
    try {
      const { transaction } = await this.findOne(id, tokenPayload);
      await this.transactionRepository.delete(transaction.id);

      return {
        message: responseTransactionsSuccessMessages.TRANSACTION_REMOVED,
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseTransactionsErrorsMessage.ERROR_TRANSACTION_REMOVE,
      );
    }
  }

  async findAllTransactionByUserId(tokenPayload: TokenPayloadDto) {
    try {
      const userTransactions = await this.transactionRepository.find({
        where: { user: { id: tokenPayload.id } },
      });

      return userTransactions;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        responseTransactionsErrorsMessage.LOAD_TRANSACTION_ERROR,
      );
    }
  }
}
