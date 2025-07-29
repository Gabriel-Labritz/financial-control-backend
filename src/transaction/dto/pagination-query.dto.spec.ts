import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { PaginationQueryDto } from './pagination-query.dto';
import { validate } from 'class-validator';

describe('PaginationQueryDto', () => {
  it('should validate successfully when dto is empty', async () => {
    const dto = plainToInstance(PaginationQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate successfully when all fields dto are correct', async () => {
    const dto = plainToInstance(PaginationQueryDto, {
      limit: 10,
      page: 1,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('limit', () => {
    it('should validate successfully when limit is positive number', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        limit: 10,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if limit is negative number', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        limit: -10,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail if limit is not a number', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        limit: 'abc',
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });
  });

  describe('page', () => {
    it('should validate successfully when page is positive number', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: 10,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if page is negative number', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: -10,
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail if page is not a number', async () => {
      const dto = plainToInstance(PaginationQueryDto, {
        page: 'abc',
      });
      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isPositive');
    });
  });
});
