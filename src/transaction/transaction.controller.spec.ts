import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionController } from './transaction.controller';
import { TransactionCategory } from 'src/common/enum/transaction-category.enum';
import { FilterTransactionsByMonthDto } from './dto/filter-transaction-by-month.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

describe('TransactionController', () => {
  let controller: TransactionController;
  const transactionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByMonth: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new TransactionController(transactionService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call transactionService.create with correct data', async () => {
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
      const fakeResponse = { message: 'success' };

      // mocks
      const transactionCreate =
        transactionService.create.mockResolvedValue(fakeResponse);

      // action
      const result = await controller.create(
        createTransactionDto,
        tokenPayload as any,
      );

      // asserts
      expect(transactionCreate).toHaveBeenCalledWith(
        createTransactionDto,
        tokenPayload,
      );
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('findAll', () => {
    it('should call transactionService.findAll with correct data', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const filter: FilterTransactionDto = {
        limit: 10,
        page: 1,
        type: TransactionType.EXPENSE,
      };
      const fakeResponse = { message: 'success' };

      // mocks
      const transactionFindAll =
        transactionService.findAll.mockResolvedValue(fakeResponse);

      // action
      const result = await controller.findAll(filter, tokenPayload as any);

      // asserts
      expect(transactionFindAll).toHaveBeenCalledWith(filter, tokenPayload);
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('findByMonth', () => {
    it('should call transactionService.findByMonth with correct data', async () => {
      // arrange
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const filter: FilterTransactionsByMonthDto = {
        limit: 10,
        page: 1,
        month: 7,
        year: 2025,
        type: TransactionType.EXPENSE,
      };
      const fakeResponse = { message: 'success' };

      // mocks
      const transactionFindByMonth =
        transactionService.findByMonth.mockResolvedValue(fakeResponse);

      // action
      const result = await controller.findByMonth(filter, tokenPayload as any);

      // asserts
      expect(transactionFindByMonth).toHaveBeenCalledWith(filter, tokenPayload);
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('findOne', () => {
    it('should call transactionService.findOne with correct data', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const fakeResponse = { message: 'success' };

      // mocks
      const transactionFindOne =
        transactionService.findOne.mockResolvedValue(fakeResponse);

      // action
      const result = await controller.findOne(id, tokenPayload as any);

      // asserts
      expect(transactionFindOne).toHaveBeenCalledWith(id, tokenPayload);
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('update', () => {
    it('should call transactionService.update with correct data', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const updateTransactionDto: UpdateTransactionDto = {
        title: 'new transaction title',
        amount: 200,
      };
      const fakeResponse = { message: 'success' };

      // mocks
      const transactionUpdate =
        transactionService.update.mockResolvedValue(fakeResponse);

      // action
      const result = await controller.update(
        id,
        updateTransactionDto,
        tokenPayload as any,
      );

      // asserts
      expect(transactionUpdate).toHaveBeenCalledWith(
        id,
        updateTransactionDto,
        tokenPayload,
      );
      expect(result).toEqual(fakeResponse);
    });
  });

  describe('delete', () => {
    it('should call transactionService.delete with correct data', async () => {
      // arrange
      const id = 10;
      const tokenPayload = {
        id: 1,
        nickName: 'User testing',
      };
      const fakeResponse = { message: 'success' };

      // mocks
      const transactionDelete =
        transactionService.delete.mockResolvedValue(fakeResponse);

      // action
      const result = await controller.delete(id, tokenPayload as any);

      // asserts
      expect(transactionDelete).toHaveBeenCalledWith(id, tokenPayload);
      expect(result).toEqual(fakeResponse);
    });
  });
});
