export default function truncateDecimals(n: number, digits: number): number {
  const multiplier = 10 ** digits;
  const adjustedNum = n * multiplier;
  const truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

  return truncatedNum / multiplier;
}
