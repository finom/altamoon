export default function formatBalanceMoneyNumber(num: number): string {
  if (num >= 100_000_000) {
    return `${Math.round(num / 1_000_000)}m`;
  } if (num >= 10_000_000) {
    return `${(Math.round(num / 100_000) / 10).toFixed(1)}m`;
  } if (num >= 1_000_000) {
    return `${(Math.round(num / 10_000) / 100).toFixed(2)}m`;
  } if (num >= 100_000) {
    return `${Math.round(num / 1000)}k`;
  } if (num >= 10_000) {
    return `${(Math.round(num / 100) / 10).toFixed(1)}k`;
  } if (num >= 1000) {
    return `${(Math.round(num / 10) / 100).toFixed(2)}k`;
  } if (num >= 100) {
    return `${Math.round(num)}`;
  } if (num >= 10) {
    return `${(Math.round(num * 10) / 10).toFixed(1)}`;
  }
  return `${(Math.round(num * 100) / 100).toFixed(2)}`;
}

if (process.env.NODE_ENV === 'development') {
  void import('expect').then(({ default: expect }) => {
    expect(formatBalanceMoneyNumber(1_234_567_890)).toBe('1235m');
    expect(formatBalanceMoneyNumber(123_456_789)).toBe('123m');
    expect(formatBalanceMoneyNumber(12_345_678.9)).toBe('12.3m');
    expect(formatBalanceMoneyNumber(12_000_000)).toBe('12.0m');
    expect(formatBalanceMoneyNumber(1_234_567.89)).toBe('1.23m');
    expect(formatBalanceMoneyNumber(1_200_000)).toBe('1.20m');
    expect(formatBalanceMoneyNumber(1_000_000)).toBe('1.00m');
    expect(formatBalanceMoneyNumber(123_456.789)).toBe('123k');
    expect(formatBalanceMoneyNumber(12_345.6789)).toBe('12.3k');
    expect(formatBalanceMoneyNumber(12_000)).toBe('12.0k');
    expect(formatBalanceMoneyNumber(1_234.56789)).toBe('1.23k');
    expect(formatBalanceMoneyNumber(1_200)).toBe('1.20k');
    expect(formatBalanceMoneyNumber(1_000)).toBe('1.00k');
    expect(formatBalanceMoneyNumber(123.456789)).toBe('123');
    expect(formatBalanceMoneyNumber(12.3456789)).toBe('12.3');
    expect(formatBalanceMoneyNumber(12)).toBe('12.0');
    expect(formatBalanceMoneyNumber(1.23456789)).toBe('1.23');
    expect(formatBalanceMoneyNumber(1.2)).toBe('1.20');
    expect(formatBalanceMoneyNumber(1)).toBe('1.00');
    expect(formatBalanceMoneyNumber(0.123456789)).toBe('0.12');
    expect(formatBalanceMoneyNumber(0.1)).toBe('0.10');
    expect(formatBalanceMoneyNumber(0.0123456789)).toBe('0.01');
    expect(formatBalanceMoneyNumber(0.00123456789)).toBe('0.00');
  });
}
