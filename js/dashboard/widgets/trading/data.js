'use strict'
const {config} = require('../../../config')

let leverage
let reduceOnly = config.get('order.reduceOnly')
let postOnly = config.get('order.postOnly')
let baseQty
let qty = { 'buy': baseQty, 'sell': baseQty }

events.once('api.exchangeInfoUpdate', d => {
    let symbolInfo = d.symbols.filter(x => x.symbol === SYMBOL)[0]
    let lotSize = symbolInfo.filters.filter(x => x.filterType === 'LOT_SIZE')[0]
    baseQty = lotSize.minQty
    qty.buy = qty.buy || baseQty
    qty.sell = qty.sell || baseQty
})

module.exports = {
    get leverage () { return leverage },
    set leverage (value) { leverage = value },

    get reduceOnly () { return reduceOnly },
    set reduceOnly (value) { reduceOnly = value },

    get postOnly () { return postOnly },
    set postOnly (value) { postOnly = value },

    price: { 'buy': undefined, 'sell': undefined },
    qty: qty,
}
