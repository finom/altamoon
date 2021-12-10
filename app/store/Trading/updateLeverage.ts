import * as api from '../../api';

export default async function updateLeverage(this: altamoon.RootStore['trading']): Promise<void> {
  const { symbol } = this.store.persistent;

  this.leverageChangeRequestsCount += 1;

  try {
    const { currentSymbolLeverage } = this;
    const resp = await api.futuresLeverage(symbol, currentSymbolLeverage);

    if (currentSymbolLeverage !== resp.leverage) {
      this.currentSymbolLeverage = resp.leverage;
    }

    this.openPositions = this.openPositions
      .map((item) => (item.symbol === symbol
        ? { ...item, leverage: resp.leverage } : item));
  } catch {
    const currentPosition = this.allSymbolsPositionRisk[symbol];
    if (currentPosition) {
      this.currentSymbolLeverage = +currentPosition.leverage; // if errored, roll it back
    }
  }

  this.leverageChangeRequestsCount -= 1;
}
