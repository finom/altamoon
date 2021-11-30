[altamoon](../README.md) / [Modules](../modules.md) / types

# Module: types

## Table of contents

### Interfaces

- [BalanceItem](../interfaces/types.BalanceItem.md)
- [FutureAsset](../interfaces/types.FutureAsset.md)
- [FuturePosition](../interfaces/types.FuturePosition.md)
- [FuturesAccount](../interfaces/types.FuturesAccount.md)
- [FuturesAggTradeStreamTicker](../interfaces/types.FuturesAggTradeStreamTicker.md)
- [FuturesChartCandle](../interfaces/types.FuturesChartCandle.md)
- [FuturesDepth](../interfaces/types.FuturesDepth.md)
- [FuturesExchangeInfo](../interfaces/types.FuturesExchangeInfo.md)
- [FuturesExchangeInfoSymbol](../interfaces/types.FuturesExchangeInfoSymbol.md)
- [FuturesIncome](../interfaces/types.FuturesIncome.md)
- [FuturesLeverageBracket](../interfaces/types.FuturesLeverageBracket.md)
- [FuturesLeverageResponse](../interfaces/types.FuturesLeverageResponse.md)
- [FuturesMarkPriceTicker](../interfaces/types.FuturesMarkPriceTicker.md)
- [FuturesMiniTicker](../interfaces/types.FuturesMiniTicker.md)
- [FuturesOrder](../interfaces/types.FuturesOrder.md)
- [FuturesPositionRisk](../interfaces/types.FuturesPositionRisk.md)
- [FuturesTicker](../interfaces/types.FuturesTicker.md)
- [FuturesUserTrades](../interfaces/types.FuturesUserTrades.md)
- [UserDataEventAccountConfigUpdate](../interfaces/types.UserDataEventAccountConfigUpdate.md)
- [UserDataEventAccountUpdate](../interfaces/types.UserDataEventAccountUpdate.md)
- [UserDataEventAccountUpdateBalance](../interfaces/types.UserDataEventAccountUpdateBalance.md)
- [UserDataEventAccountUpdateData](../interfaces/types.UserDataEventAccountUpdateData.md)
- [UserDataEventAccountUpdatePosition](../interfaces/types.UserDataEventAccountUpdatePosition.md)
- [UserDataEventExpired](../interfaces/types.UserDataEventExpired.md)
- [UserDataEventMarginCall](../interfaces/types.UserDataEventMarginCall.md)
- [UserDataEventMarginCallPosition](../interfaces/types.UserDataEventMarginCallPosition.md)
- [UserDataEventOrderUpdate](../interfaces/types.UserDataEventOrderUpdate.md)
- [UserDataEventOrderUpdateData](../interfaces/types.UserDataEventOrderUpdateData.md)

### Type aliases

- [CandlestickChartInterval](types.md#candlestickchartinterval)
- [ContractType](types.md#contracttype)
- [FuturesExchangeInfoFilter](types.md#futuresexchangeinfofilter)
- [IncomeType](types.md#incometype)
- [MarginType](types.md#margintype)
- [OrderExecutionType](types.md#orderexecutiontype)
- [OrderSide](types.md#orderside)
- [OrderStatus](types.md#orderstatus)
- [OrderType](types.md#ordertype)
- [PositionMarginType](types.md#positionmargintype)
- [PositionSide](types.md#positionside)
- [RateLimitInterval](types.md#ratelimitinterval)
- [RateLimiter](types.md#ratelimiter)
- [TimeInForce](types.md#timeinforce)
- [UserDataEvent](types.md#userdataevent)
- [UserDataEventAccountUpdateReason](types.md#userdataeventaccountupdatereason)
- [WorkingType](types.md#workingtype)

## Type aliases

### CandlestickChartInterval

Ƭ **CandlestickChartInterval**: ``"1m"`` \| ``"3m"`` \| ``"5m"`` \| ``"15m"`` \| ``"30m"`` \| ``"1h"`` \| ``"2h"`` \| ``"4h"`` \| ``"6h"`` \| ``"8h"`` \| ``"12h"`` \| ``"1d"`` \| ``"3d"`` \| ``"1w"`` \| ``"1M"``

#### Defined in

[types.ts:5](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L5)

___

### ContractType

Ƭ **ContractType**: ``"PERPETUAL"`` \| ``"CURRENT_MONTH"`` \| ``"NEXT_MONTH"`` \| ``"CURRENT_MONTH_DELIVERING"`` \| ``"NEXT_MONTH_DELIVERING"``

#### Defined in

[types.ts:6](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L6)

___

### FuturesExchangeInfoFilter

Ƭ **FuturesExchangeInfoFilter**: { `filterType`: ``"PRICE_FILTER"`` ; `maxPrice`: `string` ; `minPrice`: `string` ; `tickSize`: `string`  } \| { `filterType`: ``"LOT_SIZE"`` ; `maxQty`: `string` ; `minQty`: `string` ; `stepSize`: `string`  } \| { `filterType`: ``"MARKET_LOT_SIZE"`` ; `maxQty`: `string` ; `minQty`: `string` ; `stepSize`: `string`  } \| { `filterType`: ``"MAX_NUM_ORDERS"`` ; `limit`: `number`  } \| { `filterType`: ``"MAX_NUM_ALGO_ORDERS"`` ; `limit`: `number`  } \| { `filterType`: ``"MIN_NOTIONAL"`` ; `notional`: `string`  } \| { `filterType`: ``"PERCENT_PRICE"`` ; `multiplierDecimal`: `string` ; `multiplierDown`: `string` ; `multiplierUp`: `string`  }

#### Defined in

[types.ts:211](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L211)

___

### IncomeType

Ƭ **IncomeType**: ``"TRANSFER"`` \| ``"WELCOME_BONUS"`` \| ``"REALIZED_PNL"`` \| ``"FUNDING_FEE"`` \| ``"COMMISSION"`` \| ``"INSURANCE_CLEAR"``

#### Defined in

[types.ts:20](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L20)

___

### MarginType

Ƭ **MarginType**: ``"ISOLATED"`` \| ``"CROSSED"``

#### Defined in

[types.ts:3](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L3)

___

### OrderExecutionType

Ƭ **OrderExecutionType**: ``"NEW"`` \| ``"CANCELED"`` \| ``"CALCULATED"`` \| ``"EXPIRED"`` \| ``"TRADE"``

#### Defined in

[types.ts:10](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L10)

___

### OrderSide

Ƭ **OrderSide**: ``"BUY"`` \| ``"SELL"``

#### Defined in

[types.ts:2](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L2)

___

### OrderStatus

Ƭ **OrderStatus**: ``"NEW"`` \| ``"PARTIALLY_FILLED"`` \| ``"FILLED"`` \| ``"CANCELED"`` \| ``"REJECTED"`` \| ``"EXPIRED"`` \| ``"NEW_INSURANCE"`` \| ``"NEW_ADL"``

#### Defined in

[types.ts:9](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L9)

___

### OrderType

Ƭ **OrderType**: ``"LIMIT"`` \| ``"MARKET"`` \| ``"STOP"`` \| ``"STOP_MARKET"`` \| ``"TAKE_PROFIT"`` \| ``"TAKE_PROFIT_MARKET"`` \| ``"TRAILING_STOP_MARKET"``

#### Defined in

[types.ts:8](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L8)

___

### PositionMarginType

Ƭ **PositionMarginType**: ``"isolated"`` \| ``"cross"``

#### Defined in

[types.ts:4](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L4)

___

### PositionSide

Ƭ **PositionSide**: ``"BOTH"`` \| ``"LONG"`` \| ``"SHORT"``

#### Defined in

[types.ts:1](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L1)

___

### RateLimitInterval

Ƭ **RateLimitInterval**: ``"MINUTE"`` \| ``"SECOND"`` \| ``"DAY"``

#### Defined in

[types.ts:7](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L7)

___

### RateLimiter

Ƭ **RateLimiter**: ``"REQUEST_WEIGHT"`` \| ``"ORDERS"``

#### Defined in

[types.ts:11](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L11)

___

### TimeInForce

Ƭ **TimeInForce**: ``"GTC"`` \| ``"IOC"`` \| ``"FOK"`` \| ``"GTX"``

Time in force (timeInForce):
GTC - Good Till Cancel
IOC - Immediate or Cancel
FOK - Fill or Kill
GTX - Good Till Crossing (Post Only)

#### Defined in

[types.ts:19](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L19)

___

### UserDataEvent

Ƭ **UserDataEvent**: [`UserDataEventExpired`](../interfaces/types.UserDataEventExpired.md) \| [`UserDataEventMarginCall`](../interfaces/types.UserDataEventMarginCall.md) \| [`UserDataEventAccountUpdate`](../interfaces/types.UserDataEventAccountUpdate.md) \| [`UserDataEventOrderUpdate`](../interfaces/types.UserDataEventOrderUpdate.md) \| [`UserDataEventAccountConfigUpdate`](../interfaces/types.UserDataEventAccountConfigUpdate.md)

#### Defined in

[types.ts:450](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L450)

___

### UserDataEventAccountUpdateReason

Ƭ **UserDataEventAccountUpdateReason**: ``"DEPOSIT"`` \| ``"WITHDRAW"`` \| ``"ORDER"`` \| ``"FUNDING_FEE"`` \| ``"WITHDRAW_REJECT"`` \| ``"ADJUSTMENT"`` \| ``"INSURANCE_CLEAR"`` \| ``"ADMIN_DEPOSIT"`` \| ``"ADMIN_WITHDRAW"`` \| ``"MARGIN_TRANSFER"`` \| ``"MARGIN_TYPE_CHANGE"`` \| ``"ASSET_TRANSFER"`` \| ``"OPTIONS_PREMIUM_FEE"`` \| ``"OPTIONS_SETTLE_PROFIT"`` \| ``"AUTO_EXCHANGE"``

#### Defined in

[types.ts:347](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L347)

___

### WorkingType

Ƭ **WorkingType**: ``"MARK_PRICE"`` \| ``"CONTRACT_PRICE"``

#### Defined in

[types.ts:21](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/types.ts#L21)
