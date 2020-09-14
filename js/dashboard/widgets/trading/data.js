'use strict'
const {config} = require('../../../config')

let leverage
let reduceOnly = config.get('order.reduceOnly')
let postOnly = config.get('order.postOnly')
let baseQty = .001

module.exports = {
    get leverage () { return leverage },
    set leverage (value) { leverage = value },

    get reduceOnly () { return reduceOnly },
    set reduceOnly (value) { reduceOnly = value },

    get postOnly () { return postOnly },
    set postOnly (value) { postOnly = value },

    price: { 'buy': undefined, 'sell': undefined },
    qty: { 'buy': baseQty, 'sell': baseQty },
}
