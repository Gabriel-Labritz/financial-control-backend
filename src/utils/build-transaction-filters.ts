import { TransactionCategory } from 'src/common/enum/transaction-category.enum';
import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import { Between, FindOptionsWhere } from 'typeorm';

interface FiltersOptions {
  type?: TransactionType;
  category?: TransactionCategory;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export function buildTransactionsFilters(
  user: User,
  filtersOptions?: FiltersOptions,
): FindOptionsWhere<Transaction> {
  const filters: FindOptionsWhere<Transaction> = {
    user: { id: user.id },
  };

  if (filtersOptions?.type) filters.type = filtersOptions.type;
  if (filtersOptions?.category) filters.category = filtersOptions.category;
  if (filtersOptions?.dateRange)
    filters.createdAt = Between(
      filtersOptions.dateRange.from,
      filtersOptions.dateRange.to,
    );

  return filters;
}
