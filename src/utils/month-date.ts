export function monthDate(month: number, year: number) {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  return { firstDayOfMonth, lastDayOfMonth };
}
