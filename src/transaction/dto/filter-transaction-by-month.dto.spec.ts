import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FilterTransactionsByMonthDto } from './filter-transaction-by-month.dto';
import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { TransactionCategory } from 'src/common/enum/transaction-category.enum';

describe('FilterTransactionByMonthDto', () => {
  it('should validate successfully when all fields dto are correct', async () => {
    const dto = plainToInstance(FilterTransactionsByMonthDto, {
      month: 7,
      year: 2025,
      type: TransactionType.EXPENSE,
      category: TransactionCategory.OTHER,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('month', () => {
    it('should validate successfully when month is a positive number', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: 7,
        year: 2025,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should fail if month is a negative number', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: -7,
        year: 2025,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('month');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail if month is not a integer number', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: 7.5,
        year: 2025,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('month');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail if min month is less than 1', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: 0,
        year: 2025,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('month');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail if max month is greather than 12', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: 13,
        year: 2025,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('month');
      expect(errors[0].constraints).toHaveProperty('max');
    });
  });

  describe('year', () => {
    it('should validate successfully when year is a positive number', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: 7,
        year: 2025,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should fail if year is a negative number', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: 7,
        year: -2025,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('year');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail if year is not a integer number', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: 7,
        year: 2025.12,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('year');
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should fail if year is less than 2025', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: 7,
        year: 2024,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('year');
      expect(errors[0].constraints).toHaveProperty('min');
    });
  });

  describe('type', () => {
    it('should fail if type is not a valid enum value ', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: 7,
        year: 2025,
        type: 'other value here!',
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('type');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('category', () => {
    it('should fail if category is not a valid enum value ', async () => {
      const dto = plainToInstance(FilterTransactionsByMonthDto, {
        month: 7,
        year: 2025,
        category: 'other value here!',
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('category');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
