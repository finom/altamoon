'use strict'
const api = require('./api-futures')

module.exports = { getPnl, getDailyPnl }

function getBreakEven () {
    // TODO
}

function getPnl () {
    if (!api.positions[0] || api.positions[0].qty == 0)
        return {pnl: 0, percent: 0}

    var qty = api.positions[0].qty
    var price = parseFloat(api.lastTrade.p)
    var entryPrice = parseFloat(api.positions[0].price)

    var pnl = (price - entryPrice) / entryPrice * qty * price
    return {
        pnl: pnl,
        percent: pnl / api.account.totalWalletBalance
    }
}

var timer
var incomeHistory

async function getDailyPnl() {
    var currentBalance = +api.account.totalWalletBalance

    // Throttle api calls
    if (!timer || Date.now() > timer + 5 * 1000) {
        timer = Date.now()
        // Get all balance modifying events since 4am
        var response = await api.binance.futuresIncome({
            symbol: SYMBOL,
            startTime: new Date().setHours(4),
            endTime: Date.now()
        })
        if (response)
            incomeHistory = response
    }

    if (!incomeHistory)
        return { pnl: 0, percent: 0 }

    var pnlArray = incomeHistory.filter(
        x => x.incomeType == 'REALIZED_PNL' && x.symbol == SYMBOL
    )

    var totalPnl = 0
    for (let x of pnlArray)
        totalPnl += +x.income

    var oldBalance = currentBalance - totalPnl

    return {
        pnl: totalPnl,
        percent: totalPnl / oldBalance
    }
}
