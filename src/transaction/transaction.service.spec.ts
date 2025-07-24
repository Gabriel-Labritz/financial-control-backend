import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { TransactionCategory } from 'src/common/enum/transaction-category.enum';
import { ApiResponseDto } from 'src/common/dtos/api-response.dto';
import { ResponseSuccessMessages } from 'src/common/enum/response-success-messages.enum';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { ResponseErrorsMessages } from 'src/common/enum/response-errors-messages.enum';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionsByMonthDto } from './dto/filter-transaction-by-month.dto';
import * as buildFiltersHelper from '../utils/build-transaction-filters';
import * as calculateSummary from '../utils/calculate-transaction-summary';
import * as monthDate from '../utils/month-date';

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
            remove: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUser: jest.fn(),
          },
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
    it('should create a transaction successfully', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const createTransactionDto: CreateTransactionDto = {
        title: 'Testing',
        amount: 100,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        description: 'Testing the create transaction from user logged',
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
        createdAt: new Date(),
        transactions: [],
      };
      const newTransaction = {
        title: createTransactionDto.title,
        amount: createTransactionDto.amount,
        type: createTransactionDto.type,
        category: createTransactionDto.category,
        description: createTransactionDto.description,
        user,
      };

      // mocks
      const spyFindUser = jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue(user as any);
      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(newTransaction as any);
      const spySave = jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(newTransaction as any);

      // action
      const result = await transactionService.create(
        createTransactionDto,
        tokenPayload as any,
      );

      // assert
      expect(spyFindUser).toHaveBeenCalledWith(tokenPayload);
      expect(spySave).toHaveBeenCalledWith(newTransaction);
      expect(result).toStrictEqual(
        new ApiResponseDto({
          message: ResponseSuccessMessages.TRANSACTION_CREATED,
          data: newTransaction,
        }),
      );
    });

    it('should throw an HttpException when an http error occurs', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const createTransactionDto: CreateTransactionDto = {
        title: 'Testing',
        amount: 100,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        description: 'Testing the create transaction from user logged',
      };
      const httpError = new NotFoundException();

      jest.spyOn(userService, 'findUser').mockRejectedValue(httpError);

      // assert
      await expect(
        transactionService.create(createTransactionDto, tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an InternalServerErrorException for others errors', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const createTransactionDto: CreateTransactionDto = {
        title: 'Testing',
        amount: 100,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        description: 'Testing the create transaction from user logged',
      };

      const genericError = new Error();

      jest.spyOn(userService, 'findUser').mockRejectedValue(genericError);

      await expect(
        transactionService.create(createTransactionDto, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should find all and return transactions without filters', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const filter: FilterTransactionDto = {
        limit: 10,
        page: 1,
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
      };
      const transactions = [
        {
          title: 'testing',
          amount: 100,
          type: TransactionType.EXPENSE,
          category: TransactionCategory.OTHER,
          description: 'testing find all',
        },
      ];
      const totalItems = 1;
      const summary = {
        totalIncome: 0,
        totalExpense: 100,
        balance: -100,
      };

      // mocks
      const spyFindUser = jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue(user as any);
      const spyBuildFilters = jest
        .spyOn(buildFiltersHelper, 'buildTransactionsFilters')
        .mockReturnValue({ user: { id: user.id } });
      const spyFindAndCount = jest
        .spyOn(transactionRepository, 'findAndCount')
        .mockResolvedValue([transactions as any, totalItems]);
      const spySummary = jest
        .spyOn(calculateSummary, 'calculateTransactionSummary')
        .mockReturnValue(summary);

      // action
      const result = await transactionService.findAll(
        filter,
        tokenPayload as any,
      );

      // assert
      expect(spyFindUser).toHaveBeenCalledWith(tokenPayload);
      expect(spyBuildFilters).toHaveBeenCalledWith(user, {
        category: undefined,
        type: undefined,
      });
      expect(spyFindAndCount).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
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
        take: filter.limit,
        skip: (Number(filter.page) - 1) * Number(filter.limit),
      });
      expect(spySummary).toHaveBeenCalledWith(transactions);
      expect(result).toStrictEqual(
        new ApiResponseDto({
          message: ResponseSuccessMessages.TRANSACTIONS_LOADED,
          summary,
          data: transactions,
          pagination: {
            currentPage: Number(filter.page),
            itemsPerPage: Number(filter.limit),
            totalItems,
            totalPages: Math.ceil(totalItems / Number(filter.limit)),
          },
        }),
      );
    });

    it('should find all and return transactions applying category and type filters', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const filter: FilterTransactionDto = {
        limit: 10,
        page: 1,
        category: TransactionCategory.OTHER,
        type: TransactionType.EXPENSE,
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
      };
      const transactions = [
        {
          title: 'testing',
          amount: 100,
          type: TransactionType.EXPENSE,
          category: TransactionCategory.OTHER,
          description: 'testing find all',
        },
      ];
      const totalItems = 1;
      const summary = {
        totalIncome: 0,
        totalExpense: 100,
        balance: -100,
      };

      // mocks
      const spyFindUser = jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue(user as any);
      const spyBuildFilters = jest
        .spyOn(buildFiltersHelper, 'buildTransactionsFilters')
        .mockReturnValue({
          user: { id: user.id },
          type: filter.type,
          category: filter.category,
        });
      const spyFindAndCount = jest
        .spyOn(transactionRepository, 'findAndCount')
        .mockResolvedValue([transactions as any, totalItems]);
      const spySummary = jest
        .spyOn(calculateSummary, 'calculateTransactionSummary')
        .mockReturnValue(summary);

      // action
      const result = await transactionService.findAll(
        filter,
        tokenPayload as any,
      );

      // assert
      expect(spyFindUser).toHaveBeenCalledWith(tokenPayload);
      expect(spyBuildFilters).toHaveBeenCalledWith(user, {
        category: filter.category,
        type: filter.type,
      });
      expect(spyFindAndCount).toHaveBeenCalledWith({
        where: {
          user: { id: user.id },
          type: filter.type,
          category: filter.category,
        },
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
        take: filter.limit,
        skip: (Number(filter.page) - 1) * Number(filter.limit),
      });
      expect(spySummary).toHaveBeenCalledWith(transactions);
      expect(result).toStrictEqual(
        new ApiResponseDto({
          message: ResponseSuccessMessages.TRANSACTIONS_LOADED,
          summary,
          data: transactions,
          pagination: {
            currentPage: Number(filter.page),
            itemsPerPage: Number(filter.limit),
            totalItems,
            totalPages: Math.ceil(totalItems / Number(filter.limit)),
          },
        }),
      );
    });

    it('should throw an HttpException when an http error occurs', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const filter: FilterTransactionDto = {
        limit: 10,
        page: 1,
      };

      const httpError = new NotFoundException();

      jest.spyOn(userService, 'findUser').mockRejectedValue(httpError);

      // assert
      await expect(
        transactionService.findAll(filter, tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an InternalServerErrorException for others errors', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const filter: FilterTransactionDto = {
        limit: 10,
        page: 1,
      };

      const genericError = new Error();

      jest.spyOn(userService, 'findUser').mockRejectedValue(genericError);

      await expect(
        transactionService.findAll(filter, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findByMonth', () => {
    it('should find all transactions applying month filters only', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const filter: FilterTransactionsByMonthDto = {
        month: 7,
        year: 2025,
        limit: 10,
        page: 1,
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
      };
      const transactions = [
        {
          id: 1,
          title: 'Testing',
          amount: 100,
          type: TransactionType.EXPENSE,
          category: TransactionCategory.OTHER,
          description: 'Testing findByMonth',
          createdAt: new Date(),
        },
      ];
      const from = new Date(filter.year, filter.month - 1, 1);
      const to = new Date(filter.year, filter.month, 0, 23, 59, 59, 999);
      const totalItems = 1;
      const summary = {
        totalIncome: 0,
        totalExpense: 100,
        balance: -100,
      };

      // mocks
      const spyMonthDate = jest.spyOn(monthDate, 'monthDate').mockReturnValue({
        firstDayOfMonth: from,
        lastDayOfMonth: to,
      });
      const spyFindUser = jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue(user as any);
      const spyBuildFilters = jest
        .spyOn(buildFiltersHelper, 'buildTransactionsFilters')
        .mockReturnValue({
          user: {
            id: user.id,
          },
        });
      const spyFindAndCount = jest
        .spyOn(transactionRepository, 'findAndCount')
        .mockResolvedValue([transactions as any, totalItems]);
      const spySummary = jest
        .spyOn(calculateSummary, 'calculateTransactionSummary')
        .mockReturnValue(summary);

      // action
      const result = await transactionService.findByMonth(
        filter,
        tokenPayload as any,
      );

      // asserts
      expect(spyMonthDate).toHaveBeenCalledWith(filter.month, filter.year);
      expect(spyFindUser).toHaveBeenCalledWith(tokenPayload);
      expect(spyBuildFilters).toHaveBeenCalledWith(user, {
        dateRange: {
          from,
          to,
        },
      });
      expect(spyFindAndCount).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
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
        take: filter.limit,
        skip: (Number(filter.page) - 1) * Number(filter.limit),
      });
      expect(spySummary).toHaveBeenCalledWith(transactions);
      expect(result).toStrictEqual(
        new ApiResponseDto({
          message: ResponseSuccessMessages.TRANSACTIONS_LOADED,
          data: transactions,
          summary,
          pagination: {
            currentPage: Number(filter.page),
            itemsPerPage: Number(filter.limit),
            totalItems,
            totalPages: Math.ceil(totalItems / Number(filter.limit)),
          },
        }),
      );
    });

    it('should find all transactions applying month, category and type filters', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const filter: FilterTransactionsByMonthDto = {
        month: 7,
        year: 2025,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        limit: 10,
        page: 1,
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
      };
      const transactions = [
        {
          id: 1,
          title: 'Testing',
          amount: 100,
          type: TransactionType.EXPENSE,
          category: TransactionCategory.OTHER,
          description: 'Testing findByMonth',
          createdAt: new Date(),
        },
      ];
      const from = new Date(filter.year, filter.month - 1, 1);
      const to = new Date(filter.year, filter.month, 0, 23, 59, 59, 999);
      const totalItems = 1;
      const summary = {
        totalIncome: 0,
        totalExpense: 100,
        balance: -100,
      };

      // mocks
      const spyMonthDate = jest.spyOn(monthDate, 'monthDate').mockReturnValue({
        firstDayOfMonth: from,
        lastDayOfMonth: to,
      });
      const spyFindUser = jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue(user as any);
      const spyBuildFilters = jest
        .spyOn(buildFiltersHelper, 'buildTransactionsFilters')
        .mockReturnValue({
          user: {
            id: user.id,
          },
        });
      const spyFindAndCount = jest
        .spyOn(transactionRepository, 'findAndCount')
        .mockResolvedValue([transactions as any, totalItems]);
      const spySummary = jest
        .spyOn(calculateSummary, 'calculateTransactionSummary')
        .mockReturnValue(summary);

      // action
      const result = await transactionService.findByMonth(
        filter,
        tokenPayload as any,
      );

      // asserts
      expect(spyMonthDate).toHaveBeenCalledWith(filter.month, filter.year);
      expect(spyFindUser).toHaveBeenCalledWith(tokenPayload);
      expect(spyBuildFilters).toHaveBeenCalledWith(user, {
        type: filter.type,
        category: filter.category,
        dateRange: {
          from,
          to,
        },
      });
      expect(spyFindAndCount).toHaveBeenCalledWith({
        where: { user: { id: user.id } },
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
        take: filter.limit,
        skip: (Number(filter.page) - 1) * Number(filter.limit),
      });
      expect(spySummary).toHaveBeenCalledWith(transactions);
      expect(result).toStrictEqual(
        new ApiResponseDto({
          message: ResponseSuccessMessages.TRANSACTIONS_LOADED,
          data: transactions,
          summary,
          pagination: {
            currentPage: Number(filter.page),
            itemsPerPage: Number(filter.limit),
            totalItems,
            totalPages: Math.ceil(totalItems / Number(filter.limit)),
          },
        }),
      );
    });

    it('should throw an HttpException when an http error occurs', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const filter: FilterTransactionsByMonthDto = {
        month: 7,
        year: 2025,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        limit: 10,
        page: 1,
      };

      const httpError = new NotFoundException();

      jest.spyOn(userService, 'findUser').mockRejectedValue(httpError);

      // assert
      await expect(
        transactionService.findByMonth(filter, tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an InternalServerErrorException for others errors', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const filter: FilterTransactionsByMonthDto = {
        month: 7,
        year: 2025,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        limit: 10,
        page: 1,
      };

      const genericError = new Error();

      jest.spyOn(userService, 'findUser').mockRejectedValue(genericError);

      await expect(
        transactionService.findByMonth(filter, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should find one transaction from user logged', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
      };
      const transaction = {
        id,
        title: 'testing',
        amount: 100,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        description: 'testing find one transaction',
        createdAt: new Date(),
      };

      // mocks
      const spyFindUser = jest
        .spyOn(userService, 'findUser')
        .mockResolvedValue(user as any);
      const spyFindOneTransaction = jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValue(transaction as any);

      // action
      const result = await transactionService.findOne(id, tokenPayload as any);

      // asserts
      expect(spyFindUser).toHaveBeenCalledWith(tokenPayload);
      expect(spyFindOneTransaction).toHaveBeenCalledWith({
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
      expect(result).toEqual(transaction);
    });

    it('should throw a NotFoundException when transaction not found', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const user = {
        id: tokenPayload.id,
        nickName: tokenPayload.nickName,
      };

      jest.spyOn(userService, 'findUser').mockResolvedValue(user as any);
      jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(null);

      // assert
      await expect(
        transactionService.findOne(id, tokenPayload as any),
      ).rejects.toThrow(
        new NotFoundException(ResponseErrorsMessages.TRANSACTION_NOT_FOUND),
      );
    });

    it('should throw an HttpException when an http error occurs', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const httpError = new NotFoundException();

      jest.spyOn(userService, 'findUser').mockRejectedValue(httpError);

      // assert
      await expect(
        transactionService.findOne(id, tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an InternalServerErrorException for others errors', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };

      const genericError = new Error();

      jest.spyOn(userService, 'findUser').mockRejectedValue(genericError);

      await expect(
        transactionService.findOne(id, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update a transaction from user logged', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const updateTransactionDto: UpdateTransactionDto = {
        title: 'new title',
        amount: 150,
      };
      const transaction = {
        id,
        title: 'old title',
        amount: 100,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        description: 'testing find one transaction',
        createdAt: new Date(),
      };
      const updatedTransaction = {
        ...transaction,
        title: updateTransactionDto.title,
        amount: updateTransactionDto.amount,
      };

      // mocks
      const spyFindOneTransaction = jest
        .spyOn(transactionService, 'findOne')
        .mockResolvedValue(transaction as any);
      const spySave = jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(updatedTransaction as any);

      // action
      const result = await transactionService.update(
        id,
        updateTransactionDto,
        tokenPayload as any,
      );

      // asserts
      expect(spyFindOneTransaction).toHaveBeenCalledWith(id, tokenPayload);
      expect(spySave).toHaveBeenCalledWith({
        ...transaction,
        title: updateTransactionDto.title,
        amount: updateTransactionDto.amount,
      });
      expect(result).toStrictEqual(
        new ApiResponseDto({
          message: ResponseSuccessMessages.TRANSACTION_UPDATED,
          data: transaction,
        }),
      );
    });

    it('should throw an HttpException when an http error occurs', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const updateTransactionDto: UpdateTransactionDto = {
        title: 'new title',
        amount: 150,
      };

      const httpError = new NotFoundException();

      jest.spyOn(transactionService, 'findOne').mockRejectedValue(httpError);

      // assert
      await expect(
        transactionService.update(
          id,
          updateTransactionDto,
          tokenPayload as any,
        ),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an InternalServerErrorException for others errors', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const updateTransactionDto: UpdateTransactionDto = {
        title: 'new title',
        amount: 150,
      };

      const genericError = new Error();

      jest.spyOn(transactionService, 'findOne').mockRejectedValue(genericError);

      await expect(
        transactionService.update(
          id,
          updateTransactionDto,
          tokenPayload as any,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete a transaction from user logged', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const transaction = {
        id,
        title: 'old title',
        amount: 100,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.OTHER,
        description: 'testing find one transaction',
        createdAt: new Date(),
      };

      // mocks
      const spyFindOneTransaction = jest
        .spyOn(transactionService, 'findOne')
        .mockResolvedValue(transaction as any);
      const spyDelete = jest
        .spyOn(transactionRepository, 'remove')
        .mockResolvedValue(transaction as any);

      // actions
      const result = await transactionService.delete(id, tokenPayload as any);

      // asserts
      expect(spyFindOneTransaction).toHaveBeenCalledWith(id, tokenPayload);
      expect(spyDelete).toHaveBeenCalledWith(transaction);
      expect(result).toStrictEqual(
        new ApiResponseDto({
          message: ResponseSuccessMessages.TRANSACTION_DELETED,
        }),
      );
    });

    it('should throw an HttpException when an http error occurs', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const httpError = new NotFoundException();

      jest.spyOn(transactionService, 'findOne').mockRejectedValue(httpError);

      // assert
      await expect(
        transactionService.delete(id, tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw an InternalServerErrorException for others errors', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };

      const genericError = new Error();

      jest.spyOn(transactionService, 'findOne').mockRejectedValue(genericError);

      await expect(
        transactionService.delete(id, tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
