import * as api from '../../api';
import floorByPrecision from '../../lib/floorByPrecision';

export default function floorPriceByTickSize(
  info: api.FuturesExchangeInfoSymbol, price: number,
): number {
  if (!info) return price;

  const priceFilter = info.filters.find(({ filterType }) => filterType === 'PRICE_FILTER');

  // priceFilter.filterType !== 'PRICE_FILTER' is used to ensute TS type
  if (!priceFilter || priceFilter.filterType !== 'PRICE_FILTER') return floorByPrecision(price, info.pricePrecision);

  const precision = String(+priceFilter.tickSize).split('.')[1].length;

  return floorByPrecision(price, precision);
}
