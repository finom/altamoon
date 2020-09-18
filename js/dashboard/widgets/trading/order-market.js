'use strict'
const api = require('../../../apis/futures')
const {Order} = require('./order')
const data = require('./data')


class OrderMarket extends Order {

    constructor () {
        super()
        this.orderType = 'market'
    }

    _addHTML (html) {
        super._addHTML(html)

        this.buyBtn.html('MARKET BUY')
        this.sellBtn.html('MARKET SELL')
    }

    _addEventListeners () {
        super._addEventListeners()

        this.onPriceUpdate = d => {
            this.updateMarketMarginCost(d)
            this.updateMarketDollarValue(d)
            this.updateMarketFee(d)
        }
        events.on('api.priceUpdate', this.onPriceUpdate)
    }

    cleanupBeforeRemoval () {
        super.cleanupBeforeRemoval()
        events.off('api.priceUpdate', this.onPriceUpdate)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   QUANTITY
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    updateMarketDollarValue (price) {
        this.updateDollarValue('buy', price)
        this.updateDollarValue('sell', price)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   MARGIN COST
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    updateMarketMarginCost (price) {
        this.updateMarginCost('buy', price)
        this.updateMarginCost('sell', price)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   FEE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    updateMarketFee (price) {
        this.updateFee('buy', price)
        this.updateFee('sell', price)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   BUY / SELL
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    sendOrder (side, qty) {
        qty = qty || data.qty[side]

        let order = (side === 'buy')
                ? api.lib.futuresMarketBuy
                : api.lib.futuresMarketSell

        order(SYMBOL, qty, {
                'reduceOnly': data.reduceOnly.toString()
            })
            .catch(error => console.error(error))
    }
}

module.exports = { OrderMarket }
