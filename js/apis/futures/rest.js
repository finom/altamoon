'use strict'
const cache = require('./cache')


module.exports = class Rest {

    constructor (lib) {
        this.lib = lib
    }

    //  –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   PUT
    //  –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    cancelOrder (id) {
        this.lib.futuresCancel(SYMBOL, {orderId: id})
            // .then(r => console.log(r))
            .catch(err => console.error(err))
    }

    closePosition (symbol = SYMBOL) {
        let position = cache.positions.filter(x => x.symbol === symbol)[0]
        let qty = position.qty

        if (qty < 0)
            this.lib.futuresMarketBuy(symbol, -qty, {'reduceOnly': true})
                .catch(error => console.error(error))
        else if (qty > 0)
            this.lib.futuresMarketSell(symbol, qty, {'reduceOnly': true})
                .catch(error => console.error(error))
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   GET
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    getCandles (params = {}) {
        let { interval = '1m', limit = 1500 } = params

        this.lib.futuresCandles(SYMBOL, interval, {limit: limit})
            .then(response => {
                let candles = response .map(d => {
                    let date = new Date(+d[0])
                    return {
                        date: date,
                        timestamp: date.getTime(),
                        direction: (+d[1] <= +d[4]) ? 'up' : 'down',
                        open: +d[1],
                        high: +d[2],
                        low: +d[3],
                        close: +d[4],
                        volume: +d[7]
                    }
                })
                events.emit('api.candlesUpdate', candles)
            })
            .catch(err => console.error(err))
    }

    getAccount () {
        this.lib.futuresAccount()
            .then(response => {
                response.balance = response.totalWalletBalance // Add alias
                cache.account = response
                events.emit('api.balancesUpdate', response)
            })
            .catch(err => {
                if (err.code == 'ETIMEDOUT')
                    console.warn('Warning: getAccount() request timed out')
            })
    }

    getExchangeInfo () {
        this.lib.futuresExchangeInfo()
            .then(response => {
                cache.exchangeInfo = response
                events.emit('api.exchangeInfoUpdate', response)
            })
            .catch(err => console.error(err))
    }

    getOpenOrders () {
        this.lib.futuresOpenOrders(SYMBOL)
            .then(response => {
                cache.openOrders = response.map(o => { return {
                    id: o.orderId,
                    clientID: o.clientOrderId,
                    filledQty: o.executedQty,
                    price: o.price,
                    value: o.price, // synonym, for techan.substance
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
                events.emit('api.orderUpdate', cache.openOrders)
            })
            .catch(err => console.error(err))
    }

    getPosition () {
        this.lib.futuresPositionRisk()
            .then(response => {
                let positions = response.map(p => { return {
                    leverage: +p.leverage,
                    liquidation: +p.liquidationPrice,
                    margin: +p.isolatedMargin,
                    marginType: p.marginType,
                    price: +p.entryPrice,
                    value: +p.entryPrice, // synonym, for techan.substance
                    qty: +p.positionAmt,
                    baseValue: p.positionAmt * p.entryPrice,
                    side: (p.positionAmt >= 0) ? 'buy' : 'sell',
                    symbol: p.symbol
                } })
                cache.positions = positions
                cache.position = positions .filter(x => x.symbol === SYMBOL)[0]
                events.emit('api.positionUpdate', cache.positions)
            })
            .catch(err => console.error(err))
    }

    /**
     * Returns all trades associated with the open position
     * for @symbol.
     */
    async getPositionTrades (symbol = SYMBOL) {
        let p = cache.positions.filter(x => x.symbol === symbol)[0]
        let direction = (p.side == "buy") ? 1 : -1

        let trades = await this.lib.futuresUserTrades(symbol)

        let orderSum = 0
        let i = trades.lastIndex

        for (i; i >= 0 ; i--) {
            let orderDirection = (trades[i].side == "BUY") ? 1 : -1
            orderSum += orderDirection * trades[i].qty

            // Fixme: find proper fix for the very small values
            if (direction * (p.qty - orderSum) <= 0.001)
                break
        }
        trades = trades.slice(i, trades.length)

        return trades
    }
}
