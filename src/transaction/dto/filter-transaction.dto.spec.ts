import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FilterTransactionDto } from './filter-transaction.dto';
import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { TransactionCategory } from 'src/common/enum/transaction-category.enum';

describe('FilterTransactionDto', () => {
  it('should validate successfully when dto is empty', async () => {
    const dto = plainToInstance(FilterTransactionDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate successfully when all fields dto are correct', async () => {
    const dto = plainToInstance(FilterTransactionDto, {
      type: TransactionType.EXPENSE,
      category: TransactionCategory.OTHER,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('type', () => {
    it('should validate successfully when type is valid enum value', async () => {
      const dto = plainToInstance(FilterTransactionDto, {
        type: TransactionType.EXPENSE,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if type is not a valid enum value ', async () => {
      const dto = plainToInstance(FilterTransactionDto, {
        type: 'other value here!',
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('type');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('category', () => {
    it('should validate successfully when category is valid enum value', async () => {
      const dto = plainToInstance(FilterTransactionDto, {
        category: TransactionCategory.OTHER,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if category is not a valid enum value ', async () => {
      const dto = plainToInstance(FilterTransactionDto, {
        category: 'other value here!',
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('category');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });
});
