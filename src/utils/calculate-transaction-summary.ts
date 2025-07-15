import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { Transaction } from 'src/transaction/entities/transaction.entity';

export function calculateTransactionSummary(transactions: Transaction[]) {
  const totalIncome = Number(
    transactions
      .filter((transaction) => transaction.type === TransactionType.INCOME)
      .reduce((acc, value) => acc + Number(value.amount), 0)
      .toFixed(2),
  );

  const totalExpense = Number(
    transactions
      .filter((transaction) => transaction.type === TransactionType.EXPENSE)
      .reduce((acc, value) => acc + Number(value.amount), 0)
      .toFixed(2),
  );

  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
  };
}
