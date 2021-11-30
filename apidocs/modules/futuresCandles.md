[altamoon](../README.md) / [Modules](../modules.md) / futuresCandles

# Module: futuresCandles

## Table of contents

### Functions

- [default](futuresCandles.md#default)
- [runtimeTestCandlesOrder](futuresCandles.md#runtimetestcandlesorder)

## Functions

### default

▸ **default**(`__namedParameters`): `Promise`<[`FuturesChartCandle`](../interfaces/types.FuturesChartCandle.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.interval` | [`CandlestickChartInterval`](types.md#candlestickchartinterval) |
| `__namedParameters.lastCandleFromCache?` | `boolean` |
| `__namedParameters.limit` | `number` |
| `__namedParameters.symbol` | `string` |

#### Returns

`Promise`<[`FuturesChartCandle`](../interfaces/types.FuturesChartCandle.md)[]\>

#### Defined in

[futuresCandles.ts:69](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/futuresCandles.ts#L69)

___

### runtimeTestCandlesOrder

▸ **runtimeTestCandlesOrder**(`interval`, `candles`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `interval` | [`CandlestickChartInterval`](types.md#candlestickchartinterval) |
| `candles` | [`FuturesChartCandle`](../interfaces/types.FuturesChartCandle.md)[] |

#### Returns

`void`

#### Defined in

[futuresCandles.ts:25](https://github.com/Altamoon/altamoon/blob/198a6cd/app/api/futuresCandles.ts#L25)
