export default function floorByPrecision(num: number, precision = 0): number {
  return Math.floor(num * (10 ** precision)) / (10 ** precision);
}
