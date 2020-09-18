'use strict'
const api = require('../../../apis/futures')
const {parseInputNumber} = require('../../../snippets')
const {Order} = require('./order')
const data = require('./data')


class OrderStopMarket extends Order {

    constructor () {
        super()
        this.orderType = 'stop-market'
    }

    _addHTML (html) {
        super._addHTML(html)

        this.buyPrice = d3.select('#buy-price')
        this.sellPrice = d3.select('#sell-price')

        d3.selectAll('.input.price label')
            .html('Trigger price')

        this.buyBtn.html('STOP MARKET BUY')
        this.sellBtn.html('STOP MARKET SELL')
    }

    _addEventListeners () {
        super._addEventListeners()

        this.buyPrice.on('input', () => this.onInputPrice('buy'))
        this.sellPrice.on('input', () => this.onInputPrice('sell'))
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   PRICE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    onInputPrice (side) {
        let price = data.price[side] = parseInputNumber()
        this.updateDollarValue(side, price)
        this.updateMarginCost(side, price)
        this.updateFee(side, price)
    }

    updatePrice (side, price) {
        super.updatePrice(side, price)

        let input = (side === 'buy') ? this.buyPrice : this.sellPrice
        input.value(price)

        this.updateDollarValue(side, price)
        this.updateMarginCost(side, price)
        this.updateFee(side, price)
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
                'reduceOnly': data.reduceOnly.toString(),
                'type': 'STOP_MARKET',
                'stopPrice': data.price[side],
                'workingType': 'CONTRACT_PRICE',
            })
            .catch(error => console.error(error))
    }
}

module.exports = { OrderStopMarket }
