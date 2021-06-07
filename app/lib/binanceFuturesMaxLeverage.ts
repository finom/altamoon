import * as api from '../api';

const leverages: Record<string, number> = {};

export default async function binanceFuturesMaxLeverage(symbol: string): Promise<number> {
  if (leverages[symbol]) return leverages[symbol];
  let resp;
  try {
    resp = await api.futuresLeverageBracket(symbol);
  } catch {
    return 1;
  }
  if (!resp.length) {
    return 1;
  }
  const [{
    brackets: [{ initialLeverage }],
  }] = resp;

  leverages[symbol] = initialLeverage;

  return initialLeverage;
}
