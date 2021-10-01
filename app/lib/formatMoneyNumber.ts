export default function formatMoneyNumber(num: number): string {
  if (num >= 100_000_000_000) {
    return `${Math.round(num / 1000_000_000)}b`;
  } if (num >= 10_000_000_000) {
    return `${Math.round(num / 100_000_000) / 10}b`;
  } if (num >= 1_000_000_000) {
    return `${Math.round(num / 10_000_000) / 100}b`;
  } if (num >= 100_000_000) {
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
    expect(formatMoneyNumber(1_234_567_890_123)).to.be('1235b');
    expect(formatMoneyNumber(123_456_789_012)).to.be('123b');
    expect(formatMoneyNumber(12_345_678_901)).to.be('12.3b');
    expect(formatMoneyNumber(1_234_567_890)).to.be('1.23b');
    expect(formatMoneyNumber(123_456_789)).to.be('123m');
    expect(formatMoneyNumber(12_345_678.9)).to.be('12.3m');
    expect(formatMoneyNumber(12_000_000)).to.be('12.0m');
    expect(formatMoneyNumber(1_234_567.89)).to.be('1.23m');
    expect(formatMoneyNumber(1_200_000)).to.be('1.20m');
    expect(formatMoneyNumber(1_000_000)).to.be('1.00m');
    expect(formatMoneyNumber(123_456.789)).to.be('123k');
    expect(formatMoneyNumber(12_345.6789)).to.be('12.3k');
    expect(formatMoneyNumber(12_000)).to.be('12.0k');
    expect(formatMoneyNumber(1_234.56789)).to.be('1.23k');
    expect(formatMoneyNumber(1_200)).to.be('1.20k');
    expect(formatMoneyNumber(1_000)).to.be('1.00k');
    expect(formatMoneyNumber(123.456789)).to.be('123');
    expect(formatMoneyNumber(12.3456789)).to.be('12.3');
    expect(formatMoneyNumber(12)).to.be('12.0');
    expect(formatMoneyNumber(1.23456789)).to.be('1.23');
    expect(formatMoneyNumber(1.2)).to.be('1.20');
    expect(formatMoneyNumber(1)).to.be('1.00');
    expect(formatMoneyNumber(0.123456789)).to.be('0.12');
    expect(formatMoneyNumber(0.1)).to.be('0.10');
    expect(formatMoneyNumber(0.0123456789)).to.be('0.01');
    expect(formatMoneyNumber(0.00123456789)).to.be('0.00');
  });
}
