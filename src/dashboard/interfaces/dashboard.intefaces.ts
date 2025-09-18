export interface MonthlySummary {
  [key: string]: {
    totalIncomes: number;
    totalExpenses: number;
  };
}

export interface ExpensesByCategory {
  [key: string]: {
    expenses: number;
  };
}
