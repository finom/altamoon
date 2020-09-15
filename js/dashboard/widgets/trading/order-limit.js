'use strict'
const {Order} = require('./order')

class OrderLimit extends Order {

    constructor () {
        super()
        this.orderType = 'limit'
    }

    _addHTML (html) {
        super._addHTML(html)

        this.buyPrice = d3.select('#buy-price')
        this.sellPrice = d3.select('#sell-price')
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

        let input = (side == 'buy') ? this.buyPrice : this.sellPrice
        input.value(price)

        this.updateDollarValue(side, price)
        this.updateMarginCost(side, price)
        this.updateFee(side, price)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   BUY / SELL
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    sendOrder (side) {
        let price = data.price[side]
        if (price <= 0) return

        let order = (side === 'buy')
                ? api.lib.futuresBuy
                : api.lib.futuresSell

        order(SYMBOL, data.qty[side], price, {
                'timeInForce': (data.postOnly) ? 'GTX' : 'GTC',
                'reduceOnly': data.reduceOnly.toString()
            })
            .catch(error => console.error(error))
    }
}

module.exports = { OrderLimit }
