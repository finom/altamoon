/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'
const api = require('../../../apis/futures')
const {parseInputNumber} = require('../../../snippets')
const {Order} = require('./order')
const data = require('./data')

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
    sendOrder (side, qty) {
        qty = qty || data.qty[side]

        let price = data.price[side]
        if (price <= 0) return

        let order = (side === 'buy')
                ? api.lib.futuresBuy
                : api.lib.futuresSell

        order(SYMBOL, qty, price, {
                'timeInForce': (data.postOnly) ? 'GTX' : 'GTC',
                'reduceOnly': data.reduceOnly.toString()
            })
            .catch(error => console.error(error))
    }
}

module.exports = { OrderLimit }
