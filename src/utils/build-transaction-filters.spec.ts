import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { buildTransactionsFilters } from './build-transaction-filters';
import { TransactionCategory } from 'src/common/enum/transaction-category.enum';
import { Between } from 'typeorm';

describe('BuildTransactionFilter', () => {
  it('should build filter with all filters options', () => {
    // arrange
    const user = {
      id: 1,
      nickName: 'testing',
    };
    const filtersOptions = {
      type: TransactionType.EXPENSE,
      category: TransactionCategory.ENTERTAINMENT,
      dateRange: {
        from: new Date(2025, 6, 1),
        to: new Date(2025, 6, 31, 29, 59, 59, 999),
      },
    };

    // action
    const filter = buildTransactionsFilters(user as any, filtersOptions);

    // asserts
    expect(filter).toEqual({
      user: { id: 1 },
      type: TransactionType.EXPENSE,
      category: TransactionCategory.ENTERTAINMENT,
      createdAt: Between(
        filtersOptions.dateRange.from,
        filtersOptions.dateRange.to,
      ),
    });
  });

  it('should build filter with only user', () => {
    // arrange
    const user = {
      id: 1,
      nickName: 'testing',
    };

    // action
    const filter = buildTransactionsFilters(user as any);

    // asserts
    expect(filter).toEqual({ user: { id: 1 } });
  });

  it('should build filter with type', () => {
    // arrange
    const user = {
      id: 1,
      nickName: 'testing',
    };
    const filtersOptions = {
      type: TransactionType.EXPENSE,
    };

    // action
    const filter = buildTransactionsFilters(user as any, filtersOptions);

    // asserts
    expect(filter).toEqual({ user: { id: 1 }, type: TransactionType.EXPENSE });
  });

  it('should build filter with category', () => {
    // arrange
    const user = {
      id: 1,
      nickName: 'testing',
    };
    const filtersOptions = {
      category: TransactionCategory.ENTERTAINMENT,
    };

    // action
    const filter = buildTransactionsFilters(user as any, filtersOptions);

    // asserts
    expect(filter).toEqual({
      user: { id: 1 },
      category: TransactionCategory.ENTERTAINMENT,
    });
  });

  it('should build filter with date range', () => {
    // arrange
    const user = {
      id: 1,
      nickName: 'testing',
    };
    const filtersOptions = {
      dateRange: {
        from: new Date(2025, 6, 1),
        to: new Date(2025, 6, 31, 29, 59, 59, 999),
      },
    };

    // action
    const filter = buildTransactionsFilters(user as any, filtersOptions);

    // asserts
    expect(filter).toEqual({
      user: { id: 1 },
      createdAt: Between(
        filtersOptions.dateRange.from,
        filtersOptions.dateRange.to,
      ),
    });
  });
});
