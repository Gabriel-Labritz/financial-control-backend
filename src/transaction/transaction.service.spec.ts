import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { Transaction } from './entity/Transaction';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTransactionDto } from './dto/create_transaction.dto';
import { TransactionTypes } from '../common/enums/transaction/transaction_types.enum';
import { TransactionCategories } from '../common/enums/transaction/transaction_categories.enum';
import { responseTransactionsSuccessMessages } from '../common/enums/success/success_transactions/response_transactions_success_messages.enum';
import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let userService: UserService;
  let transactionRepository: Repository<Transaction>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {},
        },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(transactionService).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction from user logged', async () => {
      // arranges
      const createTransactionDto: CreateTransactionDto = {
        title: 'Testing',
        amount: 2000,
        type: TransactionTypes.EXPENSE,
        category: TransactionCategories.HEALTH,
        description: 'testing create',
      };
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const expectedNewTransaction = {
        ...createTransactionDto,
        user: { id: tokenPayload.id },
      };

      // mocks
      const spyCreateTransaction = jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(expectedNewTransaction as any);
      const spySaveTransaction = jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(expectedNewTransaction as any);

      // action
      const result = await transactionService.create(
        createTransactionDto,
        tokenPayload as any,
      );

      // asserts
      expect(spyCreateTransaction).toHaveBeenCalledWith(expectedNewTransaction);
      expect(spySaveTransaction).toHaveBeenCalledWith(expectedNewTransaction);
      expect(result).toEqual({
        message: responseTransactionsSuccessMessages.TRANSACTION_CREATED,
        newTransaction: expectedNewTransaction,
      });
    });
    it('should throw HttpException when a http errors occurs', async () => {
      // arranges
      const createTransactionDto: CreateTransactionDto = {
        title: 'Testing',
        amount: 2000,
        type: TransactionTypes.EXPENSE,
        category: TransactionCategories.HEALTH,
        description: 'testing create',
      };
      const tokenPayload = {
        id: 1,
        name: 'Jonh',
      };
      const httpError = new BadRequestException();

      // mocks
      jest.spyOn(transactionRepository, 'save').mockRejectedValue(httpError);

      // action and assert
      await expect(
        transactionService.create(createTransactionDto, tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException when a unknown errors occurs', async () => {
      // arranges
      const createTransactionDto: CreateTransactionDto = {
        title: 'Testing',
        amount: 2000,
        type: TransactionTypes.EXPENSE,
        category: TransactionCategories.HEALTH,
        description: 'testing create',
      };
      const tokenPayload = {
        id: 1,
        name: 'Jonh',
      };
      const unknownError = new Error();

      // mocks
      jest.spyOn(transactionRepository, 'save').mockRejectedValue(unknownError);

      // action and assert
      await expect(
        transactionService.create(createTransactionDto, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
