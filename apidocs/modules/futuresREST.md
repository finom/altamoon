# Module: futuresREST

## References

### futuresCandles

Renames and re-exports [default](futuresCandles.md#default)

## Variables

### futuresIntervals

• **futuresIntervals**: [`CandlestickChartInterval`](types.md#candlestickchartinterval)[]

Array of all possible intervals.

**`example`**
```ts
import { futuresIntervals } from 'altamoon-binance-api';

console.log(futuresIntervals);
```

#### Defined in

[futuresREST.ts:21](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L21)

## Functions

### futuresAccount

▸ **futuresAccount**(): `Promise`<[`FuturesAccount`](../interfaces/types.FuturesAccount.md)\>

Account Information V2 (USER_DATA)

**`remarks`** Get current account information.

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#account-information-v2-user_data](https://binance-docs.github.io/apidocs/futures/en/#account-information-v2-user_data)

#### Returns

`Promise`<[`FuturesAccount`](../interfaces/types.FuturesAccount.md)\>

Account information

#### Defined in

[futuresREST.ts:122](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L122)

___

### futuresAllOrders

▸ **futuresAllOrders**(`symbol?`): `Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)[]\>

All Orders (USER_DATA)

**`remarks`** Get all account orders; active, canceled, or filled.

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#all-orders-user_data](https://binance-docs.github.io/apidocs/futures/en/#all-orders-user_data)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `symbol?` | `string` | Symbol |

#### Returns

`Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)[]\>

#### Defined in

[futuresREST.ts:74](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L74)

___

### futuresCancelAllOrders

▸ **futuresCancelAllOrders**(`symbol`): `Promise`<{ `code`: ``200`` ; `msg`: `string`  }\>

Cancel All Open Orders (TRADE)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `symbol` | `string` | Symbol |

#### Returns

`Promise`<{ `code`: ``200`` ; `msg`: `string`  }\>

Request info

#### Defined in

[futuresREST.ts:348](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L348)

___

### futuresCancelOrder

▸ **futuresCancelOrder**(`symbol`, `options`): `Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

Cancel Order (TRADE)

**`remarks`** Cancel an active order. Either `orderId` or `origClientOrderId` must be sent.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `symbol` | `string` | Symbol |
| `options` | `Object` | Order information |
| `options.orderId?` | `number` | Order ID |
| `options.origClientOrderId?` | `string` | Previously used newClientOrderId |

#### Returns

`Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

Canceled order

#### Defined in

[futuresREST.ts:336](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L336)

___

### futuresDepth

▸ **futuresDepth**(`symbol`): `Promise`<[`FuturesDepth`](../interfaces/types.FuturesDepth.md)\>

Get order Book

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `symbol` | `string` | Symbol |

#### Returns

`Promise`<[`FuturesDepth`](../interfaces/types.FuturesDepth.md)\>

#### Defined in

[futuresREST.ts:141](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L141)

___

### futuresExchangeInfo

▸ **futuresExchangeInfo**(): `Promise`<[`FuturesExchangeInfo`](../interfaces/types.FuturesExchangeInfo.md)\>

Get exchange Information

**`remarks`** Current exchange trading rules and symbol information

#### Returns

`Promise`<[`FuturesExchangeInfo`](../interfaces/types.FuturesExchangeInfo.md)\>

#### Defined in

[futuresREST.ts:149](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L149)

___

### futuresGetDataStream

▸ **futuresGetDataStream**(): `Promise`<{ `listenKey`: `string`  }\>

Start User Data Stream (USER_STREAM)

**`remarks`**
Start a new user data stream. The stream will close after 60 minutes unless a keepalive is sent.
If the account has an active listenKey, that listenKey will be returned
and its validity will be extended for 60 minutes.

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#start-user-data-stream-user_stream](https://binance-docs.github.io/apidocs/futures/en/#start-user-data-stream-user_stream)

#### Returns

`Promise`<{ `listenKey`: `string`  }\>

Data stream key

#### Defined in

[futuresREST.ts:112](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L112)

___

### futuresIncome

▸ **futuresIncome**(`params`): `Promise`<[`FuturesIncome`](../interfaces/types.FuturesIncome.md)[]\>

Get Income History (USER_DATA)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | `Object` | Request params |
| `params.endTime?` | `number` | Timestamp in ms to get funding until INCLUSIVE |
| `params.incomeType?` | [`IncomeType`](types.md#incometype) | Incomr type |
| `params.limit?` | `number` | Default 100; max 1000 |
| `params.recvWindow?` | `number` | Specify the number of milliseconds after timestamp the request is valid for |
| `params.startTime?` | `number` | Timestamp in ms to get funding from INCLUSIVE. |
| `params.symbol?` | `string` | Symbol |
| `params.timestamp?` | `number` | Millisecond timestamp of when the request was created and sent |

#### Returns

`Promise`<[`FuturesIncome`](../interfaces/types.FuturesIncome.md)[]\>

Income information array

#### Defined in

[futuresREST.ts:315](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L315)

___

### futuresLeverage

▸ **futuresLeverage**(`symbol`, `leverage`): `Promise`<[`FuturesLeverageResponse`](../interfaces/types.FuturesLeverageResponse.md)\>

Change Initial Leverage (TRADE)

**`remarks`** Change user's initial leverage of specific symbol market.

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#change-initial-leverage-trade](https://binance-docs.github.io/apidocs/futures/en/#change-initial-leverage-trade)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `symbol` | `string` | Symbol |
| `leverage` | `number` | Target initial leverage: int from 1 to 125 |

#### Returns

`Promise`<[`FuturesLeverageResponse`](../interfaces/types.FuturesLeverageResponse.md)\>

#### Defined in

[futuresREST.ts:32](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L32)

___

### futuresLeverageBracket

▸ **futuresLeverageBracket**(`symbol?`): `Promise`<{ `brackets`: [`FuturesLeverageBracket`](../interfaces/types.FuturesLeverageBracket.md)[] ; `symbol`: `string`  }[]\>

Notional and Leverage Brackets (USER_DATA)

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#notional-and-leverage-brackets-user_data](https://binance-docs.github.io/apidocs/futures/en/#notional-and-leverage-brackets-user_data)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `symbol?` | `string` | Symbol |

#### Returns

`Promise`<{ `brackets`: [`FuturesLeverageBracket`](../interfaces/types.FuturesLeverageBracket.md)[] ; `symbol`: `string`  }[]\>

Brackets

#### Defined in

[futuresREST.ts:97](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L97)

___

### futuresLimitOrder

▸ **futuresLimitOrder**(`side`, `symbol`, `quantity`, `price`, `options?`): `Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

Create limit order

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `side` | [`OrderSide`](types.md#orderside) | Order side |
| `symbol` | `string` | Symbol |
| `quantity` | `string` \| `number` | Quantity |
| `price` | `string` \| `number` | Price |
| `options` | `Object` | Additional order options |
| `options.newClientOrderId?` | `string` | A unique id among open orders. Automatically generated if not sent |
| `options.reduceOnly?` | `boolean` | Reduce only |
| `options.timeInForce?` | [`TimeInForce`](types.md#timeinforce) | Time in force |

#### Returns

`Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

New order

#### Defined in

[futuresREST.ts:232](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L232)

___

### futuresMarginType

▸ **futuresMarginType**(`symbol`, `marginType`): `Promise`<`void`\>

Change Margin Type (TRADE)

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#change-margin-type-trade](https://binance-docs.github.io/apidocs/futures/en/#change-margin-type-trade)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `symbol` | `string` | Symbol |
| `marginType` | [`MarginType`](types.md#margintype) | Margin type |

#### Returns

`Promise`<`void`\>

#### Defined in

[futuresREST.ts:44](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L44)

___

### futuresMarketOrder

▸ **futuresMarketOrder**(`side`, `symbol`, `quantity`, `options?`): `Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

Create market order

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `side` | [`OrderSide`](types.md#orderside) | Order side |
| `symbol` | `string` | Symbol |
| `quantity` | `string` \| `number` | Quantity |
| `options` | `Object` | Additional order options |
| `options.reduceOnly?` | `boolean` | Reduce only |

#### Returns

`Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

New order

#### Defined in

[futuresREST.ts:209](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L209)

___

### futuresOpenOrders

▸ **futuresOpenOrders**(`symbol?`): `Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)[]\>

Current All Open Orders (USER_DATA)

**`remarks`** Get all open orders on a symbol.

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#current-all-open-orders-user_data](https://binance-docs.github.io/apidocs/futures/en/#current-all-open-orders-user_data)
Careful when accessing this with no symbol because of high weight.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `symbol?` | `string` | Symbol |

#### Returns

`Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)[]\>

#### Defined in

[futuresREST.ts:64](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L64)

___

### futuresOrder

▸ **futuresOrder**(`options`): `Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

New Order (TRADE)

**`remarks`** Send in a new order. This is the general function used internally by `futuresMarketOrder`, `futuresLimitOrder` etc.

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#new-order-trade](https://binance-docs.github.io/apidocs/futures/en/#new-order-trade)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `FuturesOrderOptions` | Order options |

#### Returns

`Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

New order

#### Defined in

[futuresREST.ts:181](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L181)

___

### futuresPositionMargin

▸ **futuresPositionMargin**(`symbol`, `amount`, `type`): `Promise`<`unknown`\>

Modify Isolated Position Margin (TRADE)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `symbol` | `string` | Symbol |
| `amount` | `number` | Amount |
| `type` | ``1`` \| ``2`` | 1: Add position margin，2: Reduce position margin |

#### Returns

`Promise`<`unknown`\>

Request info

#### Defined in

[futuresREST.ts:359](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L359)

___

### futuresPositionRisk

▸ **futuresPositionRisk**(): `Promise`<[`FuturesPositionRisk`](../interfaces/types.FuturesPositionRisk.md)[]\>

Position Information V2 (USER_DATA)

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#position-information-v2-user_data](https://binance-docs.github.io/apidocs/futures/en/#position-information-v2-user_data)

**`remarks`** Get current position information.

#### Returns

`Promise`<[`FuturesPositionRisk`](../interfaces/types.FuturesPositionRisk.md)[]\>

#### Defined in

[futuresREST.ts:53](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L53)

___

### futuresPrices

▸ **futuresPrices**(): `Promise`<`Record`<`string`, `string`\>\>

Latest price for all symbols

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#symbol-price-ticker](https://binance-docs.github.io/apidocs/futures/en/#symbol-price-ticker)

#### Returns

`Promise`<`Record`<`string`, `string`\>\>

An object of symbols and corresponding prices

#### Defined in

[futuresREST.ts:83](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L83)

___

### futuresStopLimitOrder

▸ **futuresStopLimitOrder**(`side`, `symbol`, `quantity`, `price`, `stopPrice`, `options?`): `Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

Create stop market order

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `side` | [`OrderSide`](types.md#orderside) | Order side |
| `symbol` | `string` | Symbol |
| `quantity` | `string` \| `number` | Quantity |
| `price` | `string` \| `number` | Price |
| `stopPrice` | `string` \| `number` | Stop price |
| `options` | `Object` | Additional order options |
| `options.newClientOrderId?` | `string` | A unique id among open orders. Automatically generated if not sent |
| `options.reduceOnly?` | `boolean` | Reduce only |
| `options.timeInForce?` | [`TimeInForce`](types.md#timeinforce) | Time in force |

#### Returns

`Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

New order

#### Defined in

[futuresREST.ts:288](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L288)

___

### futuresStopMarketOrder

▸ **futuresStopMarketOrder**(`side`, `symbol`, `quantity`, `stopPrice`, `options?`): `Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

Create stop market order

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `side` | [`OrderSide`](types.md#orderside) | Order side |
| `symbol` | `string` | Symbol |
| `quantity` | `string` \| `number` | Quantity |
| `stopPrice` | `string` \| `number` | Stop price |
| `options` | `Object` | Additional order options |
| `options.reduceOnly?` | `boolean` | Reduce only |

#### Returns

`Promise`<[`FuturesOrder`](../interfaces/types.FuturesOrder.md)\>

New order

#### Defined in

[futuresREST.ts:264](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L264)

___

### futuresUserTrades

▸ **futuresUserTrades**(`symbol`): `Promise`<[`FuturesUserTrades`](../interfaces/types.FuturesUserTrades.md)[]\>

Account Trade List (USER_DATA)

**`remarks`** Get trades for a specific account and symbol.

**`see`** [https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data](https://binance-docs.github.io/apidocs/futures/en/#account-trade-list-user_data)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `symbol` | `string` | Symbol |

#### Returns

`Promise`<[`FuturesUserTrades`](../interfaces/types.FuturesUserTrades.md)[]\>

List of trades

#### Defined in

[futuresREST.ts:133](https://github.com/Altamoon/altamoon/blob/f3d1f5e/app/api/futuresREST.ts#L133)
