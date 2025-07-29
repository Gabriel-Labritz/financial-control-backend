import { plainToInstance } from 'class-transformer';
import { UpdateTransactionDto } from './update-transaction.dto';
import { validate } from 'class-validator';
import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { TransactionCategory } from 'src/common/enum/transaction-category.enum';

describe('UpdateTransactionDto', () => {
  it('should validate dto when all fields are correct', async () => {
    const dto = plainToInstance(UpdateTransactionDto, {
      title: 'testing update',
      amount: 400,
      type: TransactionType.INCOME,
      category: TransactionCategory.ENTERTAINMENT,
      description: 'testing if dto is valid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate successfully when dto is empty', async () => {
    const dto = plainToInstance(UpdateTransactionDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('title', () => {
    it('should fail if title is not a string', async () => {
      const dto = plainToInstance(UpdateTransactionDto, {
        title: 1,
        amount: 200,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.ENTERTAINMENT,
        description: 'testing if dto is valid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail if title exceeds max length', async () => {
      const dto = plainToInstance(UpdateTransactionDto, {
        title: 'a'.repeat(51),
        amount: 200,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.ENTERTAINMENT,
        description: 'testing if dto is valid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('amount', () => {
    it('should fail if amount is not a number', async () => {
      const dto = plainToInstance(UpdateTransactionDto, {
        title: 'testing',
        amount: '200',
        type: TransactionType.EXPENSE,
        category: TransactionCategory.ENTERTAINMENT,
        description: 'testing if dto is valid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('amount');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });

    it('should fail if amount is not a positive number', async () => {
      const dto = plainToInstance(UpdateTransactionDto, {
        title: 'testing',
        amount: -200,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.ENTERTAINMENT,
        description: 'testing if dto is valid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('amount');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });
  });

  describe('type', () => {
    it('should fail if type is not a valid enum value', async () => {
      const dto = plainToInstance(UpdateTransactionDto, {
        title: 'testing',
        amount: 300,
        type: 'test',
        category: TransactionCategory.ENTERTAINMENT,
        description: 'testing if dto is valid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('type');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('category', () => {
    it('should fail if category is not a valid enum value', async () => {
      const dto = plainToInstance(UpdateTransactionDto, {
        title: 'testing',
        amount: 300,
        type: TransactionType.EXPENSE,
        category: 'testing categories',
        description: 'testing if dto is valid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('category');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('description', () => {
    it('should fail if description is not a string', async () => {
      const dto = plainToInstance(UpdateTransactionDto, {
        title: 'testing',
        amount: 200,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.ENTERTAINMENT,
        description: 200,
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail if description exceeds max length', async () => {
      const dto = plainToInstance(UpdateTransactionDto, {
        title: 'testing',
        amount: 200,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.ENTERTAINMENT,
        description: 'a'.repeat(256),
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });
});
