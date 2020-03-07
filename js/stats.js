'use strict'
const api = require('./api-futures')

module.exports = { getPNL }

function getPNL () {
    if (!api.positions[0] || api.positions[0].qty == 0)
        return 0
    var qty = api.positions[0].qty
    var price = parseFloat(api.lastTrade.p)
    var entryPrice = parseFloat(api.positions[0].price)

    var pnl = (price - entryPrice) / entryPrice * qty * price
    var pnlPercent = pnl / api.account.totalWalletBalance
    return pnl
}

function getBreakEven () {

}
