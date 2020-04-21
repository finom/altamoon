'use strict'
const settings = require('../../user/settings')
const lib = new require('node-binance-api')().options({
    APIKEY: settings.apiKey,
    APISECRET: settings.apiSecret
})

class ApiFutures {
    lib = lib
    wsURL = 'wss://fstream.binance.com/ws/' + SYMBOL.toLowerCase()

    account = {}
    positions = []
    openOrders = []
    lastTrade = {}
    lastPrice

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   GET
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    getAccount () {
        lib.futuresAccount()
            .then(response => {
                this.account = response
                events.emit('api.balancesUpdate', this.account)
            })
            .catch(err => {
                if (err.code == 'ETIMEDOUT')
                    console.warn('Warning: getAccount() request timed out')
            })
    }

    getOpenOrders () {
        lib.futuresOpenOrders(SYMBOL)
            .then(response => {
                this.openOrders = response.map(o => { return {
                    id: o.orderId,
                    clientID: o.clientOrderId,
                    filledQty: o.executedQty,
                    price: o.price,
                    value: o.price, // synonym, for feeding to techan.substance
                    qty: o.origQty,
                    reduceOnly: o.reduceOnly,
                    side: o.side.toLowerCase(),
                    status: o.status,
                    stopPrice: o.stopPrice,
                    symbol: o.symbol,
                    time: o.time,
                    timeInForce: o.timeInForce,
                    type: o.type,
                    updateTime: o.updateTime
                } })
                events.emit('api.orderUpdate', this.openOrders)
            })
            .catch(err => console.error(err))
    }

    getPosition () {
        lib.futuresPositionRisk()
            .then(response => {
                let p = response[SYMBOL]
                this.positions[0] = {
                    leverage: p.leverage,
                    liquidation: p.liquidationPrice,
                    margin: p.isolatedMargin,
                    marginType: p.marginType,
                    price: p.entryPrice,
                    value: p.entryPrice, // synonym, for feeding to techan.substance
                    qty: p.positionAmt,
                    side: (p.positionAmt >= 0) ? 'buy' : 'sell',
                    symbol: p.symbol
                }
                events.emit('api.positionUpdate', this.positions)
            })
            .catch(err => console.error(err))
    }

    //  –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   PUT
    //  –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    cancelOrder (id) {
        lib.futuresCancel(SYMBOL, {orderId: id})
            // .then(r => console.log(r))
            .catch(err => console.error(err))
    }

    closePosition () {
        let qty = this.positions[0].qty

        if (qty < 0)
            lib.futuresMarketBuy(SYMBOL, -qty, {'reduceOnly': true})
                .catch(error => console.error(error))
        else if (qty > 0)
            lib.futuresMarketSell(SYMBOL, qty, {'reduceOnly': true})
                .catch(error => console.error(error))
    }

    //  –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   STREAM (WEBSOCKET)
    //  –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    streamBook () {
        let stream = new WebSocket(this.wsURL + '@depth@0ms')

        stream.onmessage = (e) => {
            let book = JSON.parse(e.data)
            events.emit('api.bookUpdate', book)
        }
    }

    streamBidAsk () {
        let stream = new WebSocket(this.wsURL + '@bookTicker')

        stream.onmessage = (e) => {
            let bidAsk = JSON.parse(e.data)
            events.emit('api.bidAskUpdate', bidAsk)
        }
    }

    streamLastTrade () {
        /* Last aggregated taker trade. Gives price, refreshed 100ms */
        let stream = new WebSocket(this.wsURL + '@aggTrade')

        stream.onmessage = (e) => {
            this.lastTrade = JSON.parse(e.data)
            this.lastPrice = this.lastTrade.p
            events.emit('api.priceUpdate', this.lastPrice)
            events.emit('api.newTrade', this.lastTrade)
        }
    }

    streamUserData () {
        // Get key
        lib.futuresGetDataStream()
            .then(response => this._openStream(response))
            .catch(err => console.error(err))
    }

    _openStream (key) {
        let stream = new WebSocket('wss://fstream.binance.com/ws/' + key.listenKey)

        // Get what happened before the stream opened
        stream.onopen = () => {
            this.getOpenOrders()
            this.getPosition()
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
                lib.futuresGetDataStream()
                    .catch(e => console.error(e))
            }, 20 * 60000
        )
        stream.onclose = this.streamUserData
    }

    _balancesUpdate (data) {
        if (this.account.totalWalletBalance != data.a.B[0].wb)
            this.getAccount()
    }

    _positionUpdate (data) {
        let p = data.a.P.filter(x => x.s == SYMBOL)[0]

        if (!this.positions[0]) this.positions[0] = {}
        Object.assign(this.positions[0], {
            margin: p.iw,
            marginType: p.mt,
            price: p.ep,
            value: p.ep, // synonym, for feeding to techan.substance
            qty: p.pa,
            side: (p.pa >= 0) ? 'buy' : 'sell',
            symbol: p.s
        })
        this.getPosition() // REST update for missing data

        events.emit('api.positionUpdate', this.positions)
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
            this.openOrders.push(order)
        }
        // Removed limit order
        if (order.type == 'LIMIT'
            && ['CANCELED', 'EXPIRED', 'FILLED'].indexOf(order.status) >= 0)
            {
            let index = this.openOrders.findIndex(x => x.id == order.id)
            if (typeof index != 'undefined') {
                this.openOrders.splice(index, 1)

                if(order.status == 'FILLED')
                    new Audio('./audio/plop.mp3').play()
            }
        }
        // Market order
        if (order.type === 'MARKET' && order.status === 'FILLED')
            new Audio('./audio/plop.mp3').play()

        events.emit('api.orderUpdate', this.openOrders)
    }
}

module.exports = new ApiFutures()
