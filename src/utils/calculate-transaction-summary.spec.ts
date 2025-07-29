import { TransactionType } from 'src/common/enum/transaction-type.enum';
import { calculateTransactionSummary } from './calculate-transaction-summary';

describe('CalculateTransactionSummary', () => {
  it('should calculate expenses, incomes from transactions', () => {
    // arrange
    const transactions = [
      {
        amount: 200,
        type: TransactionType.EXPENSE,
      },
      {
        amount: 300,
        type: TransactionType.INCOME,
      },
    ];

    // action
    const { totalExpense, totalIncome, balance } = calculateTransactionSummary(
      transactions as any,
    );

    expect(totalIncome).toBe(300);
    expect(totalExpense).toBe(200);
    expect(balance).toBe(100);
  });

  it('should return zeros when transactions list is empty', () => {
    // arrange
    const transactions = [];

    // action
    const { totalExpense, totalIncome, balance } = calculateTransactionSummary(
      transactions as any,
    );

    expect(totalIncome).toBe(0);
    expect(totalExpense).toBe(0);
    expect(balance).toBe(0);
  });

  it('should calculate only expenses when there are no incomes', () => {
    // arrange
    const transactions = [
      {
        amount: 200,
        type: TransactionType.EXPENSE,
      },
      {
        amount: 300,
        type: TransactionType.EXPENSE,
      },
    ];

    // action
    const { totalExpense, totalIncome, balance } = calculateTransactionSummary(
      transactions as any,
    );

    expect(totalIncome).toBe(0);
    expect(totalExpense).toBe(500);
    expect(balance).toBe(-500);
  });

  it('should calculate only incomes when there are no expenses', () => {
    // arrange
    const transactions = [
      {
        amount: 200,
        type: TransactionType.INCOME,
      },
      {
        amount: 300,
        type: TransactionType.INCOME,
      },
    ];

    // action
    const { totalExpense, totalIncome, balance } = calculateTransactionSummary(
      transactions as any,
    );

    expect(totalIncome).toBe(500);
    expect(totalExpense).toBe(0);
    expect(balance).toBe(500);
  });

  it('should correctly parse amount when it is a string', () => {
    // arrange
    const transactions = [
      {
        amount: '200',
        type: TransactionType.EXPENSE,
      },
      {
        amount: '300',
        type: TransactionType.INCOME,
      },
    ];

    // action
    const { totalExpense, totalIncome, balance } = calculateTransactionSummary(
      transactions as any,
    );

    expect(totalIncome).toBe(300);
    expect(totalExpense).toBe(200);
    expect(balance).toBe(100);
  });
});
