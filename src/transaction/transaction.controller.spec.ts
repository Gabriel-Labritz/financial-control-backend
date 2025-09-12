import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import {
  BadRequestException,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';
import { randomUUID } from 'crypto';
import { CreateTransactionDto } from './dto/create_transaction.dto';
import { TransactionTypes } from '../common/enums/transaction/transaction_types.enum';
import { TransactionCategories } from '../common/enums/transaction/transaction_categories.enum';
import { PaginationDto } from './dto/pagination.dto';

const mockAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    request.user = mockTokenPayload;
    return true;
  }),
};

const mockTokenPayload = {
  id: randomUUID(),
  name: 'John',
};

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call transactionService.create with the correct DTO and return success message', async () => {
      // arranges
      const createTransactionDto: CreateTransactionDto = {
        title: 'testing',
        amount: 2000,
        type: TransactionTypes.EXPENSE,
        category: TransactionCategories.TRANSPORT,
        description: 'testing controller',
      };

      const expectedResponse = { message: 'transaction created successfully' };

      // mocks
      const spyCreateTransactionService = jest
        .spyOn(transactionService, 'create')
        .mockResolvedValue(expectedResponse as any);

      // actions
      const result = await controller.createTransaction(
        createTransactionDto,
        mockTokenPayload as any,
      );

      // asserts
      expect(spyCreateTransactionService).toHaveBeenCalledWith(
        createTransactionDto,
        mockTokenPayload,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an HttpException when the transactionService throw an error', async () => {
      // arranges
      const createTransactionDto = {
        title: 'testing',
        amount: 2000,
        type: TransactionTypes.EXPENSE,
        category: TransactionCategories.TRANSPORT,
        description: 'testing controller',
      };
      const errorMessage = 'title is required';

      // mocks
      jest
        .spyOn(transactionService, 'create')
        .mockRejectedValue(new BadRequestException(errorMessage));

      // actions and asserts
      await expect(
        controller.createTransaction(
          createTransactionDto,
          mockTokenPayload as any,
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.createTransaction(
          createTransactionDto,
          mockTokenPayload as any,
        ),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('all', () => {
    it('should call transactionService.findAll with pagination DTO, tokenPayload and return expected datas', async () => {
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
      const expectedResponse = {
        message: 'transaction successfult lodded',
        transactions,
      };

      // mocks
      const spyFindAllService = jest
        .spyOn(transactionService, 'findAll')
        .mockResolvedValue(expectedResponse as any);

      // action
      const result = await controller.findAllUserTransactions(
        pagination,
        tokenPayload as any,
      );

      // asserts
      expect(spyFindAllService).toHaveBeenCalledWith(pagination, tokenPayload);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an HttpException when the transactionService.findAll throw an error', async () => {
      // arranges
      const pagination: PaginationDto = {
        limit: 10,
        page: 1,
      };
      const tokenPayload = {
        id: randomUUID(),
        name: 'Jonh',
      };
      const errorMessage = 'limit must be a number';

      // mocks
      jest
        .spyOn(transactionService, 'findAll')
        .mockRejectedValue(new BadRequestException(errorMessage));

      // actions and asserts
      await expect(
        controller.findAllUserTransactions(pagination, tokenPayload as any),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.findAllUserTransactions(pagination, tokenPayload as any),
      ).rejects.toThrow(errorMessage);
    });
  });
});
