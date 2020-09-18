'use strict'
const api = require('../../../apis/futures')
const {Order} = require('./order')
const data = require('./data')


class OrderStopLimit extends Order {

    constructor () {
        super()
        this.orderType = 'stop-limit'
    }

    _addHTML (html) {
        super._addHTML(html)

        this.buyBtn.html('STOP LIMIT BUY')
        this.sellBtn.html('STOP LIMIT SELL')
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   BUY / SELL
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    sendOrder (side, qty) {
        qty = qty || data.qty[side]

        let order = (side === 'buy')
                ? api.lib.futuresBuy
                : api.lib.futuresSell

        order(SYMBOL, data.qty[side], {
                'reduceOnly': data.reduceOnly.toString()
            })
            .catch(error => console.error(error))
    }
}

module.exports = { OrderStopLimit }
