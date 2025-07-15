import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { UserService } from 'src/user/user.service';
import { FilterByMonthDto } from './dto/filter-by-month.dto';
import { monthDate } from 'src/utils/month-date';
import { calculateTransactionSummary } from 'src/utils/calculate-transaction-summary';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ResponseSuccessMessages } from 'src/common/enum/response-success-messages.enum';
import { ResponseErrorsMessages } from 'src/common/enum/response-errors-messages.enum';
import { ApiResponseDto } from 'src/common/dtos/api-response.dto';

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
    try {
      const { title, amount, type, category, description } =
        createTransactionDto;

      const user = await this.userService.findUser(tokenPayload);

      const transactionData = {
        title,
        amount,
        type,
        category,
        description,
        user,
      };

      const newTransaction = this.transactionRepository.create(transactionData);
      await this.transactionRepository.save(newTransaction);

      return new ApiResponseDto({
        message: ResponseSuccessMessages.TRANSACTION_CREATED,
        data: transactionData,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ResponseErrorsMessages.INTERNAL_ERROR_CREATED_TRANSACTION,
      );
    }
  }

  async findAll(filter: FilterTransactionDto, tokenPayload: TokenPayloadDto) {
    const { limit = 10, page = 1, type, category } = filter;

    try {
      const user = await this.userService.findUser(tokenPayload);

      const whereConditionsFilters: FindOptionsWhere<Transaction> = {
        user: { id: user.id },
      };

      if (type) whereConditionsFilters.type = type;
      if (category) whereConditionsFilters.category = category;

      const [userTransactions, totalItems] =
        await this.transactionRepository.findAndCount({
          where: whereConditionsFilters,
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

      const summary = calculateTransactionSummary(userTransactions);

      return new ApiResponseDto<Transaction[]>({
        message: ResponseSuccessMessages.TRANSACTIONS_LOADED,
        summary,
        data: userTransactions,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ResponseErrorsMessages.INTERNAL_ERROR_LOAD_TRANSACTIONS,
      );
    }
  }

  async findByMonth(filter: FilterByMonthDto, tokenPayload: TokenPayloadDto) {
    const {
      month = 1,
      year = 2025,
      type,
      category,
      limit = 10,
      page = 1,
    } = filter;
    const { firstDayOfMonth, lastDayOfMonth } = monthDate(month, year);

    try {
      const user = await this.userService.findUser(tokenPayload);

      const whereConditionsFilters: FindOptionsWhere<Transaction> = {
        user: { id: user.id },
        createdAt: Between(firstDayOfMonth, lastDayOfMonth),
      };

      if (type) whereConditionsFilters.type = type;
      if (category) whereConditionsFilters.category = category;

      const [monthTransactions, totalItems] =
        await this.transactionRepository.findAndCount({
          where: whereConditionsFilters,
          select: [
            'id',
            'title',
            'amount',
            'type',
            'description',
            'category',
            'createdAt',
          ],
          order: { createdAt: 'DESC' },
          take: limit,
          skip: (page - 1) * limit,
        });

      const summary = calculateTransactionSummary(monthTransactions);

      return new ApiResponseDto<Transaction[]>({
        message: ResponseSuccessMessages.TRANSACTIONS_LOADED,
        summary,
        data: monthTransactions,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ResponseErrorsMessages.INTERNAL_ERROR_LOAD_TRANSACTIONS,
      );
    }
  }

  async findOne(id: number, tokenPayload: TokenPayloadDto) {
    try {
      const user = await this.userService.findUser(tokenPayload);

      const transaction = await this.transactionRepository.findOne({
        where: { id, user: { id: user.id } },
        select: [
          'id',
          'title',
          'amount',
          'type',
          'category',
          'description',
          'createdAt',
        ],
      });

      if (!transaction) {
        throw new NotFoundException(
          ResponseErrorsMessages.TRANSACTION_NOT_FOUND,
        );
      }

      return transaction;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ResponseErrorsMessages.INTERNAL_ERROR_LOAD_TRANSACTION,
      );
    }
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    tokenPayload: TokenPayloadDto,
  ) {
    try {
      const transaction = await this.findOne(id, tokenPayload);
      Object.assign(transaction, updateTransactionDto);

      const updatedTransaction =
        await this.transactionRepository.save(transaction);

      return new ApiResponseDto<Transaction>({
        message: ResponseSuccessMessages.TRANSACTION_UPDATED,
        data: updatedTransaction,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ResponseErrorsMessages.INTERNAL_ERROR_UPDATED_TRANSACTION,
      );
    }
  }

  async delete(id: number, tokenPayload: TokenPayloadDto) {
    try {
      const transaction = await this.findOne(id, tokenPayload);
      await this.transactionRepository.remove(transaction);

      return new ApiResponseDto<Transaction>({
        message: ResponseSuccessMessages.TRANSACTION_DELETED,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        ResponseErrorsMessages.INTERNAL_ERROR_DELETED_TRANSACTION,
      );
    }
  }
}
