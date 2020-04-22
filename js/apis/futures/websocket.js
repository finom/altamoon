'use strict'
const cache = require('./cache')
const UserData = require('./websocket/user-data')

let wsURL = 'wss://fstream.binance.com/ws/' + SYMBOL.toLowerCase()


module.exports = class Rest {

    wsURL = wsURL

    constructor (lib, rest) {
        this.lib = lib
        this.rest = rest
        this.userData = new UserData(lib, rest)
    }

    streamBook () {
        let stream = new WebSocket(wsURL + '@depth@0ms')

        stream.onmessage = (e) => {
            let book = JSON.parse(e.data)
            events.emit('api.bookUpdate', book)
        }
    }

    streamBidAsk () {
        let stream = new WebSocket(wsURL + '@bookTicker')

        stream.onmessage = (e) => {
            let bidAsk = JSON.parse(e.data)
            events.emit('api.bidAskUpdate', bidAsk)
        }
    }

    streamLastTrade () {
        /* Last aggregated taker trade. Gives price, refreshed 100ms */
        let stream = new WebSocket(wsURL + '@aggTrade')

        stream.onmessage = (e) => {
            cache.lastTrade = JSON.parse(e.data)
            cache.lastPrice = cache.lastTrade.p
            events.emit('api.priceUpdate', cache.lastPrice)
            events.emit('api.newTrade', cache.lastTrade)
        }
    }

    streamUserData () {
        this.userData.stream()
    }

    streamLastCandle () {
        let stream = new WebSocket(wsURL + '@kline_1m')

        stream.onmessage = event => {
            let d = JSON.parse(event.data).k

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
    }
}
