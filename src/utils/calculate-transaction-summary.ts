import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { Transaction } from 'src/transaction/entities/transaction.entity';

export function calculateTransactionSummary(transactions: Transaction[]) {
  const totalIncomeMonth = Number(
    transactions
      .filter((transaction) => transaction.type === TransactionType.INCOME)
      .reduce((acc, value) => acc + Number(value.amount), 0)
      .toFixed(2),
  );

  const totalExpenseMonth = Number(
    transactions
      .filter((transaction) => transaction.type === TransactionType.EXPENSE)
      .reduce((acc, value) => acc + Number(value.amount), 0)
      .toFixed(2),
  );

  const balanceOfMonth = totalIncomeMonth - totalExpenseMonth;

  return {
    totalIncomeMonth,
    totalExpenseMonth,
    balanceOfMonth,
  };
}
