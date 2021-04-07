import { FuturesAccount, OrderSide } from 'node-binance-api';
import binance from '../lib/binance';

interface Position {
  leverage: number;
  price: number;
  qty: number;
  baseValue: number;
  side: OrderSide;
  symbol: string;
}

export default class Account {
  public positions: Position[] = [];

  public totalWalletBalance = 0;

  public totalPositionInitialMargin = 0;

  public totalOpenOrderInitialMargin = 0;

  public futuresAccount: FuturesAccount | null = null;

  constructor() {
    void this.reloadFuturesAccount();
  }

  public readonly reloadFuturesAccount = async (): Promise<void> => {
    const futuresAccount = await binance.futuresAccount();
    this.futuresAccount = futuresAccount;
    this.totalWalletBalance = +futuresAccount.totalWalletBalance;
    this.totalPositionInitialMargin = +futuresAccount.totalPositionInitialMargin;
    this.totalOpenOrderInitialMargin = +futuresAccount.totalOpenOrderInitialMargin;
    this.positions = futuresAccount.positions.map((p) => ({
      leverage: +p.leverage,
      price: +p.entryPrice,
      qty: +p.positionAmt,
      baseValue: +p.positionAmt * +p.entryPrice,
      side: +p.positionAmt >= 0 ? 'BUY' : 'SELL',
      symbol: p.symbol,
    }));
  };
}
