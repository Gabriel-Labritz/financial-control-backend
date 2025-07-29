import { monthDate } from './month-date';

describe('monthDate', () => {
  it('should return correct first and last day for July 2025', () => {
    // arrange
    const month = 7;
    const year = 2025;

    // action
    const { firstDayOfMonth, lastDayOfMonth } = monthDate(month, year);

    // asserts
    expect(firstDayOfMonth).toEqual(new Date(2025, 6, 1));
    expect(lastDayOfMonth).toEqual(new Date(2025, 6, 31, 23, 59, 59, 999));
  });
});
