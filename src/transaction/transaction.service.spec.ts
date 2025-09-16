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
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateTransactionDto } from './dto/update_transaction.dto';

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
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
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
    it('should create a transaction from user logged in', async () => {
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
    it('should throw an HttpException when http errors occurs', async () => {
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

    it('should throw an InternalServerErrorException when an unknown errors occurs', async () => {
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

  describe('findAll', () => {
    it('should return all transaction from user logged in with pagination', async () => {
      // arranges
      const pagination: PaginationDto = {
        limit: 10,
        page: 1,
      };
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const transactions = [
        {
          id: randomUUID(),
          title: 'testing transaction 1',
        },
        {
          id: randomUUID(),
          title: 'testing transction 2',
        },
      ];
      const totalItems = 2;

      // mocks
      const spyFindAndCount = jest
        .spyOn(transactionRepository, 'findAndCount')
        .mockResolvedValue([transactions as any, totalItems]);

      // action
      const result = await transactionService.findAll(
        pagination,
        tokenPayload as any,
      );

      // asserts
      expect(spyFindAndCount).toHaveBeenCalledWith({
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
        take: pagination.limit,
        skip: (pagination.page! - 1) * pagination.limit!,
      });
      expect(result).toEqual({
        message: responseTransactionsSuccessMessages.TRANSACTIONS_LOADED,
        userTransactions: transactions,
        pagination: {
          current_page: pagination.page,
          items_per_page: pagination.limit,
          totalItems,
          total_pages: Math.ceil(totalItems / pagination.limit!),
        },
      });
    });

    it('should throw an HttpException when http error occurs', async () => {
      // arranges
      const pagination: PaginationDto = {
        limit: 10,
        page: 1,
      };
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const httpError = new BadRequestException();

      // mocks
      jest
        .spyOn(transactionRepository, 'findAndCount')
        .mockRejectedValue(httpError);

      // action and asserts
      await expect(
        transactionService.findAll(pagination, tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an InternalServerErrorException when unknown error occurs', async () => {
      // arranges
      const pagination: PaginationDto = {
        limit: 10,
        page: 1,
      };
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const unknownError = new Error();

      // mocks
      jest
        .spyOn(transactionRepository, 'findAndCount')
        .mockRejectedValue(unknownError);

      // action and asserts
      await expect(
        transactionService.findAll(pagination, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return transaction from user logged in', async () => {
      // arranges
      const id = randomUUID();
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const transaction = {
        id: randomUUID(),
        title: 'testing',
      };

      // mocks
      const spyFindOne = jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValue(transaction as any);

      // action
      const result = await transactionService.findOne(id, tokenPayload as any);

      // asserts
      expect(spyFindOne).toHaveBeenCalledWith({
        where: { id, user: { id: tokenPayload.id } },
      });
      expect(result).toEqual({
        message: responseTransactionsSuccessMessages.TRANSACTION_LOADED,
        transaction,
      });
    });

    it('should throw a NotFoundException when transaction not found', async () => {
      // arranges
      const id = randomUUID();
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };

      // mocks
      jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(null);

      // action
      await expect(
        transactionService.findOne(id, tokenPayload as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an HttpException when http error occurs', async () => {
      // arranges
      const id = randomUUID();
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const httpError = new NotFoundException();

      // mocks
      jest.spyOn(transactionRepository, 'findOne').mockRejectedValue(httpError);

      // action
      await expect(
        transactionService.findOne(id, tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an InternalServerErrorException when an unknown error occurs', async () => {
      // arranges
      const id = randomUUID();
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const unknownError = new Error();

      // mocks
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockRejectedValue(unknownError);

      // action
      await expect(
        transactionService.findOne(id, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update the transaction from user logged in', async () => {
      // arranges
      const id = randomUUID();
      const updateTransactionDto: UpdateTransactionDto = {
        title: 'new title',
        description: 'new description',
      };
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const userTransaction = {
        id,
        title: 'old title',
        description: 'old description',
      };
      const transactionUpdated = Object.assign(
        userTransaction,
        updateTransactionDto,
      );

      // mocks
      const spyFindOne = jest
        .spyOn(transactionService, 'findOne')
        .mockResolvedValue({ transaction: userTransaction } as any);
      const spySave = jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(transactionUpdated as any);

      // action
      const result = await transactionService.update(
        id,
        updateTransactionDto,
        tokenPayload as any,
      );

      // asserts
      expect(spyFindOne).toHaveBeenCalledWith(id, tokenPayload);
      expect(spySave).toHaveBeenCalledWith(transactionUpdated);
      expect(result).toEqual({
        message: responseTransactionsSuccessMessages.TRANSACTION_UPDATED,
        transaction: transactionUpdated,
      });
    });

    it('should throw a BadRequestException when request body is empty', async () => {
      // arranges
      const id = randomUUID();
      const updateTransactionDto: UpdateTransactionDto = {};
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };

      // action and asserts
      await expect(
        transactionService.update(
          id,
          updateTransactionDto,
          tokenPayload as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw an HttpException when an http error ocurrs', async () => {
      // arranges
      const id = randomUUID();
      const updateTransactionDto: UpdateTransactionDto = {
        title: 'new title',
        description: 'new description',
      };
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };

      const httpError = new NotFoundException();

      // mocks
      jest.spyOn(transactionService, 'findOne').mockRejectedValue(httpError);

      // action and asserts
      await expect(
        transactionService.update(
          id,
          updateTransactionDto,
          tokenPayload as any,
        ),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an InternalServerErrorException when an unknown error ocurrs', async () => {
      // arranges
      const id = randomUUID();
      const updateTransactionDto: UpdateTransactionDto = {
        title: 'new title',
        description: 'new description',
      };
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };

      const unknownError = new Error();

      // mocks
      jest.spyOn(transactionService, 'findOne').mockRejectedValue(unknownError);

      // action and asserts
      await expect(
        transactionService.update(
          id,
          updateTransactionDto,
          tokenPayload as any,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove a transaction from user logged in', async () => {
      // arranges
      const id = randomUUID();
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const userTransaction = {
        id,
        title: 'testing',
      };

      // mocks
      const spyFindOneTransaction = jest
        .spyOn(transactionService, 'findOne')
        .mockResolvedValue({ transaction: userTransaction } as any);
      const spyDelete = jest
        .spyOn(transactionRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      // action
      const result = await transactionService.remove(id, tokenPayload as any);

      // asserts
      expect(spyFindOneTransaction).toHaveBeenCalledWith(id, tokenPayload);
      expect(spyDelete).toHaveBeenCalledWith(userTransaction.id);
      expect(result).toEqual({
        message: responseTransactionsSuccessMessages.TRANSACTION_REMOVED,
      });
    });

    it('should throw an HttpException when an http error ocurrs', async () => {
      // arranges
      const id = randomUUID();
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };

      const httpError = new NotFoundException();

      // mocks
      jest.spyOn(transactionService, 'findOne').mockRejectedValue(httpError);

      // action and asserts
      await expect(
        transactionService.remove(id, tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an InternalServerErrorException when an unknown error ocurrs', async () => {
      // arranges
      const id = randomUUID();
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };

      const unknownError = new Error();

      // mocks
      jest.spyOn(transactionService, 'findOne').mockRejectedValue(unknownError);

      // action and asserts
      await expect(
        transactionService.remove(id, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
