'use strict'
const cache = require('./cache')

let wsURL = 'wss://fstream.binance.com/ws/' + SYMBOL.toLowerCase()


module.exports = class Rest {

    wsURL = wsURL

    constructor (lib, rest) {
        this.lib = lib
        this.rest = rest
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
        // Get key
        this.lib.futuresGetDataStream()
            .then(response => this._openStream(response))
            .catch(err => console.error(err))
    }

    _openStream (key) {
        let stream = new WebSocket('wss://fstream.binance.com/ws/' + key.listenKey)

        // Get what happened before the stream opened
        stream.onopen = () => {
            this.rest.getOpenOrders()
            this.rest.getPosition()
        }

        stream.onmessage = (e) => {
            let data = JSON.parse(e.data)

            if (data.e == 'ORDER_TRADE_UPDATE')
                this._orderUpdate(data)
            if (data.e == 'ACCOUNT_UPDATE') {
                this._positionUpdate(data)
                this._balancesUpdate(data)
            }
        }

        // Ping every 10 min to keep stream alive
        setInterval(() => {
                this.lib.futuresGetDataStream()
                    .catch(e => console.error(e))
            }, 20 * 60000
        )
        stream.onclose = this.streamUserData
    }

    _balancesUpdate (data) {
        if (cache.account.totalWalletBalance != data.a.B[0].wb)
            this.rest.getAccount()
    }

    _positionUpdate (data) {
        let p = data.a.P.filter(x => x.s == SYMBOL)[0]

        if (!cache.positions[0]) cache.positions[0] = {}
        Object.assign(cache.positions[0], {
            margin: p.iw,
            marginType: p.mt,
            price: p.ep,
            value: p.ep, // synonym, for feeding to techan.substance
            qty: p.pa,
            side: (p.pa >= 0) ? 'buy' : 'sell',
            symbol: p.s
        })
        this.rest.getPosition() // REST update for missing data

        events.emit('api.positionUpdate', cache.positions)
    }

    _orderUpdate(data) {
        let o = data.o
        let order = {
            id: o.i,
            clientID: o.c,
            filledQty: o.z,
            price: o.p,
            value: o.p, // synonym, for feeding to techan.supstance
            qty: o.q,
            reduceOnly: o.R,
            side: o.S.toLowerCase(),
            status: o.X,
            stopPrice: o.sp,
            symbol: o.s,
            time: o.T,
            timeInForce: o.f,
            type: o.o,
            updateTime: data.E
        }
        // New limit order
        if (order.status == 'NEW' && order.type == 'LIMIT') {
            cache.openOrders.push(order)
        }
        // Removed limit order
        if (order.type == 'LIMIT'
            && ['CANCELED', 'EXPIRED', 'FILLED'].indexOf(order.status) >= 0)
            {
            let index = cache.openOrders.findIndex(x => x.id == order.id)
            if (typeof index != 'undefined') {
                cache.openOrders.splice(index, 1)

                if(order.status == 'FILLED')
                    new Audio('./audio/plop.mp3').play()
            }
        }
        // Market order
        if (order.type === 'MARKET' && order.status === 'FILLED')
            new Audio('./audio/plop.mp3').play()

        events.emit('api.orderUpdate', cache.openOrders)
    }
}
