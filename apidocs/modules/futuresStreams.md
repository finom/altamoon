# Module: futuresStreams

## Functions

### futuresAggTradeStream

▸ **futuresAggTradeStream**(`givenSymbols`, `callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `givenSymbols` | `string` \| `string`[] |
| `callback` | (`ticker`: [`FuturesAggTradeStreamTicker`](../interfaces/types.FuturesAggTradeStreamTicker.md)) => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[futuresStreams.ts:10](https://github.com/Altamoon/altamoon/blob/b1afd68/app/api/futuresStreams.ts#L10)

___

### futuresCandlesSubscribe

▸ **futuresCandlesSubscribe**(`symbolIntervalPairs`, `callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbolIntervalPairs` | [`string`, [`CandlestickChartInterval`](types.md#candlestickchartinterval)][] |
| `callback` | (`candle`: [`FuturesChartCandle`](../interfaces/types.FuturesChartCandle.md)) => `void` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[futuresStreams.ts:255](https://github.com/Altamoon/altamoon/blob/b1afd68/app/api/futuresStreams.ts#L255)

___

### futuresChartSubscribe

▸ **futuresChartSubscribe**(`__namedParameters`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `FuturesChartSubscribeOptions` |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[futuresStreams.ts:309](https://github.com/Altamoon/altamoon/blob/b1afd68/app/api/futuresStreams.ts#L309)

___

### futuresMarkPriceStream

▸ **futuresMarkPriceStream**(`callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | `MarkPriceCallback`<[`FuturesMarkPriceTicker`](../interfaces/types.FuturesMarkPriceTicker.md)[]\> |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[futuresStreams.ts:193](https://github.com/Altamoon/altamoon/blob/b1afd68/app/api/futuresStreams.ts#L193)

▸ **futuresMarkPriceStream**(`symbol`, `callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbol` | `string` |
| `callback` | `MarkPriceCallback`<[`FuturesMarkPriceTicker`](../interfaces/types.FuturesMarkPriceTicker.md)\> |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[futuresStreams.ts:196](https://github.com/Altamoon/altamoon/blob/b1afd68/app/api/futuresStreams.ts#L196)

___

### futuresMiniTickerStream

▸ **futuresMiniTickerStream**(`callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | `MiniTickerCallback`<[`FuturesMiniTicker`](../interfaces/types.FuturesMiniTicker.md)[]\> |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[futuresStreams.ts:41](https://github.com/Altamoon/altamoon/blob/b1afd68/app/api/futuresStreams.ts#L41)

▸ **futuresMiniTickerStream**(`symbol`, `callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbol` | `string` |
| `callback` | `MiniTickerCallback`<[`FuturesMiniTicker`](../interfaces/types.FuturesMiniTicker.md)\> |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[futuresStreams.ts:44](https://github.com/Altamoon/altamoon/blob/b1afd68/app/api/futuresStreams.ts#L44)

___

### futuresTickerStream

▸ **futuresTickerStream**(`callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `callback` | `TickerCallback`<[`FuturesTicker`](../interfaces/types.FuturesTicker.md)[]\> |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[futuresStreams.ts:100](https://github.com/Altamoon/altamoon/blob/b1afd68/app/api/futuresStreams.ts#L100)

▸ **futuresTickerStream**(`symbol`, `callback`): () => `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `symbol` | `string` |
| `callback` | `TickerCallback`<[`FuturesTicker`](../interfaces/types.FuturesTicker.md)\> |

#### Returns

`fn`

▸ (): `void`

##### Returns

`void`

#### Defined in

[futuresStreams.ts:103](https://github.com/Altamoon/altamoon/blob/b1afd68/app/api/futuresStreams.ts#L103)
