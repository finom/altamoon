import convertType from '../../lib/convertType';
import { TradingPosition } from '../types';

type PartialPosition = Pick<TradingPosition, 'entryPrice' | 'symbol' | 'leverageBracket' | 'side' | 'positionAmt' | 'marginType' | 'isolatedWallet' | 'leverage'>;

// see https://www.binance.com/en/support/faq/b3c689c1f50a44cabb3a84e663b81d93
// TODO support hedge mode
export default function calculateLiquidationPrice(
  this: Pick<Store['trading'], 'openPositions' | 'store'>,
  totalWalletBalance: number,
  {
    symbol, entryPrice, leverageBracket, side, positionAmt, marginType, isolatedWallet, leverage,
  }: PartialPosition,
  options?: { side?: TradingPosition['side'] },
): number {
  // use 1 as amount if not given
  const pseudoAmount = positionAmt || (options?.side === 'SELL' ? -1 : 1);
  // use (entryPrice * 1 / leverage) as amount if not given
  const pseudoIsolatedWallet = positionAmt ? isolatedWallet : entryPrice / leverage;

  const WB = marginType === 'isolated' ? pseudoIsolatedWallet : totalWalletBalance; // Wallet Balance

  // Maintenance Margin of all other contracts, excluding Contract 1
  // If it is an isolated margin mode, then TMM=0，UPNL=0
  const TMM1 = marginType === 'isolated' ? 0 : this.openPositions
    .filter((pos) => pos.symbol !== symbol)
    .reduce((maintMargin, pos) => pos.maintMargin + maintMargin, 0);

  // Unrealized PNL of all other contracts, excluding Contract 1
  // If it is an isolated margin mode, then UPNL=0
  const UPNL1 = marginType === 'isolated' ? 0 : this.openPositions
    .filter((pos) => pos.symbol !== symbol).reduce((pnl, pos) => pos.pnl + pnl, 0);

  // Maintenance Amount of BOTH position (one-way mode)
  const cumB = leverageBracket?.cum ?? 0;

  // Maintenance amount of LONG position (hedge mode)
  const cumL = 0;

  // Maintenance amount of SHORT position (hedge mode)
  const cumS = 0;

  // Direction of BOTH position, 1 as long position, -1 as short position
  const Side1BOTH = side === 'BUY' ? 1 : -1;

  // Absolute value of BOTH position size (one-way mode)
  const Position1BOTH = pseudoAmount * Side1BOTH;

  // Entry Price of BOTH position (one-way mode)
  const EP1BOTH = entryPrice;

  // Absolute value of LONG position size (hedge mode)
  const Position1LONG = 0;

  // Entry Price of LONG position (hedge mode)
  const EP1LONG = 0;

  // Absolute value of SHORT position size (hedge mode)
  const Position1SHORT = 0;

  // Entry Price of SHORT position (hedge mode)
  const EP1SHORT = 0;

  // Maintenance margin rate of BOTH position (one-way mode)
  const MMB = leverageBracket?.maintMarginRatio ?? 0;

  // Maintenance margin rate of LONG position (hedge mode)
  const MML = 0;

  // Maintenance margin rate of SHORT position (hedge mode)
  const MMS = 0;

  // https://public.bnbstatic.com/image/cms/article/body/202106/0123551429dae7094a5ffc278443f88c.png
  return Math.max(0, (
    WB - TMM1 + UPNL1 + cumB + cumL + cumS
    - Side1BOTH * Position1BOTH * EP1BOTH
    - Position1LONG * EP1LONG
    + Position1SHORT * EP1SHORT
  ) / (
    Position1BOTH * MMB
    + Position1LONG * MML
    + Position1SHORT * MMS
    - Side1BOTH * Position1BOTH
    - Position1LONG + Position1SHORT
  ));
}

if (process.env.NODE_ENV === 'development') {
  const btcBrackets = [
    {
      bracket: 1,
      initialLeverage: 125,
      notionalCap: 50000,
      notionalFloor: 0,
      maintMarginRatio: 0.004,
      cum: 0,
    },
    {
      bracket: 2,
      initialLeverage: 100,
      notionalCap: 250000,
      notionalFloor: 50000,
      maintMarginRatio: 0.005,
      cum: 50,
    },
    {
      bracket: 3,
      initialLeverage: 50,
      notionalCap: 1000000,
      notionalFloor: 250000,
      maintMarginRatio: 0.01,
      cum: 1300,
    },
    {
      bracket: 4,
      initialLeverage: 20,
      notionalCap: 5000000,
      notionalFloor: 1000000,
      maintMarginRatio: 0.025,
      cum: 16300,
    },
    {
      bracket: 5,
      initialLeverage: 10,
      notionalCap: 20000000,
      notionalFloor: 5000000,
      maintMarginRatio: 0.05,
      cum: 141300,
    },
    {
      bracket: 6,
      initialLeverage: 5,
      notionalCap: 50000000,
      notionalFloor: 20000000,
      maintMarginRatio: 0.1,
      cum: 1141300,
    },
    {
      bracket: 7,
      initialLeverage: 4,
      notionalCap: 100000000,
      notionalFloor: 50000000,
      maintMarginRatio: 0.125,
      cum: 2391300,
    },
    {
      bracket: 8,
      initialLeverage: 3,
      notionalCap: 200000000,
      notionalFloor: 100000000,
      maintMarginRatio: 0.15,
      cum: 4891300,
    },
    {
      bracket: 9,
      initialLeverage: 2,
      notionalCap: 300000000,
      notionalFloor: 200000000,
      maintMarginRatio: 0.25,
      cum: 24891300,
    },
    {
      bracket: 10,
      initialLeverage: 1,
      notionalCap: 500000000,
      notionalFloor: 300000000,
      maintMarginRatio: 0.5,
      cum: 99891300,
    },
  ];

  const ethBrackets = [
    {
      bracket: 1,
      initialLeverage: 100,
      notionalCap: 10000,
      notionalFloor: 0,
      maintMarginRatio: 0.005,
      cum: 0,
    },
    {
      bracket: 2,
      initialLeverage: 75,
      notionalCap: 100000,
      notionalFloor: 10000,
      maintMarginRatio: 0.0065,
      cum: 15,
    },
    {
      bracket: 3,
      initialLeverage: 50,
      notionalCap: 500000,
      notionalFloor: 100000,
      maintMarginRatio: 0.01,
      cum: 365,
    },
    {
      bracket: 4,
      initialLeverage: 25,
      notionalCap: 1000000,
      notionalFloor: 500000,
      maintMarginRatio: 0.02,
      cum: 5365,
    },
    {
      bracket: 5,
      initialLeverage: 10,
      notionalCap: 2000000,
      notionalFloor: 1000000,
      maintMarginRatio: 0.05,
      cum: 35365,
    },
    {
      bracket: 6,
      initialLeverage: 5,
      notionalCap: 5000000,
      notionalFloor: 2000000,
      maintMarginRatio: 0.1,
      cum: 135365,
    },
    {
      bracket: 7,
      initialLeverage: 4,
      notionalCap: 10000000,
      notionalFloor: 5000000,
      maintMarginRatio: 0.125,
      cum: 260365,
    },
    {
      bracket: 8,
      initialLeverage: 3,
      notionalCap: 20000000,
      notionalFloor: 10000000,
      maintMarginRatio: 0.15,
      cum: 510365,
    },
    {
      bracket: 9,
      initialLeverage: 2,
      notionalCap: 9223372036854776000,
      notionalFloor: 20000000,
      maintMarginRatio: 0.25,
      cum: 2510365,
    },
  ];

  void import('expect.js').then(({ default: expect }) => {
    const { store } = convertType<{ store: Store }>(window);

    const getBTCPosition = (): Parameters<
      typeof calculateLiquidationPrice>[1] & Partial<TradingPosition
    > => {
      const positionAmt = 109.488;
      const entryPrice = 32481.98;
      // TODO for some ridiculous reason it's different at documentation and the test still works!
      const baseValue = 3500032.458; // positionAmt * entryPrice;

      const leverageBracket = btcBrackets.find(
        ({ notionalCap }) => notionalCap > baseValue,
      ) ?? btcBrackets[0];

      return {
        symbol: 'BTCUSDT',
        positionAmt,
        entryPrice,
        pnl: -56354.57,
        side: 'BUY',
        marginType: 'cross',
        maintMargin: leverageBracket.maintMarginRatio * baseValue - leverageBracket.cum,
        leverageBracket,
        isolatedWallet: 0,
        leverage: 1,
      };
    };

    const getETHPosition = (): Parameters<
      typeof calculateLiquidationPrice>[1] & Partial<TradingPosition
    > => {
      const positionAmt = 3683.979;
      const entryPrice = 1456.84;
      // TODO for some ridiculous reason it's different at documentation and the test still works!
      const baseValue = 4918775.081; // positionAmt * entryPrice;

      const leverageBracket = ethBrackets.find(
        ({ notionalCap }) => notionalCap > baseValue,
      ) ?? btcBrackets[0];

      return {
        symbol: 'ETHUSDT',
        positionAmt,
        entryPrice,
        pnl: -448192.89,
        side: 'BUY',
        marginType: 'cross',
        maintMargin: leverageBracket.maintMarginRatio * baseValue - leverageBracket.cum,
        leverageBracket,
        isolatedWallet: 0,
        leverage: 1,
      };
    };

    const btcPosition = getBTCPosition() as TradingPosition;
    const ethPosition = getETHPosition() as TradingPosition;

    expect(+calculateLiquidationPrice.call({
      store,
      openPositions: [ethPosition, btcPosition],
    }, 1_535_443.01, btcPosition).toFixed(2)).to.be(26316.89);

    expect(+calculateLiquidationPrice.call({
      store,
      openPositions: [ethPosition, btcPosition],
    }, 1_535_443.01, ethPosition).toFixed(2)).to.be(1153.26);
  });
}
