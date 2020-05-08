'use strict'
const cache = require('./cache')
const UserData = require('./websocket/user-data')


module.exports = class Rest {

    constructor (lib, rest) {
        this.lib = lib
        this.rest = rest
        this.userData = new UserData(lib, rest)
    }

    streamBook () {
        this.lib.futuresSubscribe(
            SYMBOL.toLowerCase() + '@depth@0ms',
            r => { events.emit('api.bookUpdate', r) },
            { reconnect: true }
        )
    }

    streamBidAsk () {
        this.lib.futuresSubscribe(
            SYMBOL.toLowerCase() + '@bookTicker',
            r => { events.emit('api.bidAskUpdate', r) },
            { reconnect: true }
        )
    }

    streamLastTrade () {
        /* Last aggregated taker trade. Gives price, refreshed 100ms */
        this.lib.futuresAggTradeStream(
            SYMBOL,
            r => {
                cache.lastTrade = r
                cache.lastPrice = cache.lastTrade.price
                events.emit('api.priceUpdate', cache.lastPrice)
                events.emit('api.newTrade', cache.lastTrade)
            },
            { reconnect: true }
        )
    }

    streamUserData () {
        this.userData.stream()
    }

    streamLastCandle () {
        this.lib.futuresSubscribe(
            SYMBOL.toLowerCase() + '@kline_1m',
            r => {
                let d = r.k

                let date = new Date(d.t)
                let direction = (parseFloat(d.o) <= parseFloat(d.c))
                    ? 'up' : 'down'

                let candle = {
                        date: date,
                        timestamp: date.getTime(),
                        direction: direction,
                        open: parseFloat(d.o),
                        high: parseFloat(d.h),
                        low: parseFloat(d.l),
                        close: parseFloat(d.c),
                        volume: parseFloat(d.q) }

                events.emit('api.lastCandleUpdate', candle)
            },
            { reconnect: true }
        )
    }
}
