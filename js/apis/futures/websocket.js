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
            SYMBOL.toLowerCase() + '@depth@500ms',
            r => { events.emit('api.bookUpdate', r) }
        )
    }

    streamBidAsk () {
        this.lib.futuresBookTickerStream(SYMBOL,
            r => { events.emit('api.bidAskUpdate', r) }
        )
    }

    streamLastTrade () {
        /* Last aggregated taker trade. Gives price, refreshed 100ms */
        this.lib.futuresAggTradeStream(SYMBOL,
            r => {
                cache.lastTrade = r
                cache.lastPrice = cache.lastTrade.price
                events.emit('api.priceUpdate', cache.lastPrice)
                events.emit('api.newTrade', cache.lastTrade)
            }
        )
    }

    streamLastCandle (interval = '1m') {
        this.lib.futuresCandlesticks(SYMBOL, interval,
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
            }
        )
    }

    terminateStream (streamName) {
        let subs = this.lib.futuresSubscriptions()
        for (let x in subs) {
            if (x.includes(SYMBOL.toLowerCase() + '@' + streamName))
                this.lib.futuresTerminate(x)
        }
    }

    streamUserData () {
        this.userData.stream()
    }
}
