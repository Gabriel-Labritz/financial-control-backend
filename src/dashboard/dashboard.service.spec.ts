import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../transaction/transaction.service';
import { DashboardService } from './dashboard.service';
import { randomUUID } from 'crypto';
import { TransactionTypes } from '../common/enums/transaction/transaction_types.enum';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let transactionService: TransactionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: TransactionService,
          useValue: {
            findAllTransactionByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(dashboardService).toBeDefined();
  });

  describe('balance', () => {
    it('should calculate and return total expenses, total incomes and total balance', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const allTransactions = [
        {
          id: randomUUID(),
          title: 'testing 1',
          amount: 200,
          type: TransactionTypes.EXPENSE,
        },
        {
          id: randomUUID(),
          title: 'testing 2',
          amount: 400,
          type: TransactionTypes.INCOME,
        },
        {
          id: randomUUID(),
          title: 'testing 3',
          amount: 100,
          type: TransactionTypes.EXPENSE,
        },
      ];

      // mocks
      const spyFindAllTransactions = jest
        .spyOn(transactionService, 'findAllTransactionByUserId')
        .mockResolvedValue(allTransactions as any);

      // action
      const result = await dashboardService.balance(tokenPayload as any);

      // asserts
      expect(spyFindAllTransactions).toHaveBeenCalledWith(tokenPayload);
      expect(result).toEqual({
        totalBalance: 100,
        totalExpenses: 300,
        totalIncomes: 400,
      });
    });

    it('should throw HttpException when a http error ocurrs', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const httpError = new NotFoundException();

      // mocks
      jest
        .spyOn(transactionService, 'findAllTransactionByUserId')
        .mockRejectedValue(httpError);

      // action and asserts
      await expect(
        dashboardService.balance(tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException when an unknown error ocurrs', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const unknownError = new Error();

      // mocks
      jest
        .spyOn(transactionService, 'findAllTransactionByUserId')
        .mockRejectedValue(unknownError);

      // action and asserts
      await expect(
        dashboardService.balance(tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('monthlyBalance', () => {
    it('should calculate total income and total expense of monthly transactions', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const allTransactions = [
        {
          id: randomUUID(),
          title: 'testing 1',
          amount: 200,
          type: TransactionTypes.EXPENSE,
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          title: 'testing 2',
          amount: 400,
          type: TransactionTypes.INCOME,
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          title: 'testing 3',
          amount: 100,
          type: TransactionTypes.EXPENSE,
          createdAt: new Date(),
        },
      ];

      // mocks
      const spyFindAllTransactions = jest
        .spyOn(transactionService, 'findAllTransactionByUserId')
        .mockResolvedValue(allTransactions as any);

      // action
      const result = await dashboardService.monthlyBalance(tokenPayload as any);

      expect(spyFindAllTransactions).toHaveBeenCalledWith(tokenPayload);
      expect(result).toEqual([
        { month: '2025-09', totalExpenses: 300, totalIncomes: 400 },
      ]);
    });

    it('should throw HttpException when a http error ocurrs', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const httpError = new NotFoundException();

      // mocks
      jest
        .spyOn(transactionService, 'findAllTransactionByUserId')
        .mockRejectedValue(httpError);

      // action and asserts
      await expect(
        dashboardService.monthlyBalance(tokenPayload as any),
      ).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException when an unknown error ocurrs', async () => {
      // arranges
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const unknownError = new Error();

      // mocks
      jest
        .spyOn(transactionService, 'findAllTransactionByUserId')
        .mockRejectedValue(unknownError);

      // action and asserts
      await expect(
        dashboardService.monthlyBalance(tokenPayload as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
