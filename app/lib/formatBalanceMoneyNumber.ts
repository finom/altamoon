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
  void import('expect.js').then(({ default: expect }) => {
    expect(formatBalanceMoneyNumber(1_234_567_890)).to.be('1235m');
    expect(formatBalanceMoneyNumber(123_456_789)).to.be('123m');
    expect(formatBalanceMoneyNumber(12_345_678.9)).to.be('12.3m');
    expect(formatBalanceMoneyNumber(12_000_000)).to.be('12.0m');
    expect(formatBalanceMoneyNumber(1_234_567.89)).to.be('1.23m');
    expect(formatBalanceMoneyNumber(1_200_000)).to.be('1.20m');
    expect(formatBalanceMoneyNumber(1_000_000)).to.be('1.00m');
    expect(formatBalanceMoneyNumber(123_456.789)).to.be('123k');
    expect(formatBalanceMoneyNumber(12_345.6789)).to.be('12.3k');
    expect(formatBalanceMoneyNumber(12_000)).to.be('12.0k');
    expect(formatBalanceMoneyNumber(1_234.56789)).to.be('1.23k');
    expect(formatBalanceMoneyNumber(1_200)).to.be('1.20k');
    expect(formatBalanceMoneyNumber(1_000)).to.be('1.00k');
    expect(formatBalanceMoneyNumber(123.456789)).to.be('123');
    expect(formatBalanceMoneyNumber(12.3456789)).to.be('12.3');
    expect(formatBalanceMoneyNumber(12)).to.be('12.0');
    expect(formatBalanceMoneyNumber(1.23456789)).to.be('1.23');
    expect(formatBalanceMoneyNumber(1.2)).to.be('1.20');
    expect(formatBalanceMoneyNumber(1)).to.be('1.00');
    expect(formatBalanceMoneyNumber(0.123456789)).to.be('0.12');
    expect(formatBalanceMoneyNumber(0.1)).to.be('0.10');
    expect(formatBalanceMoneyNumber(0.0123456789)).to.be('0.01');
    expect(formatBalanceMoneyNumber(0.00123456789)).to.be('0.00');
  });
}
