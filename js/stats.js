'use strict'
const api = require('./api-futures')

module.exports = { getPNL, getDailyPNL }

function getPNL () {
    if (!api.positions[0] || api.positions[0].qty == 0)
        return 0
    var qty = api.positions[0].qty
    var price = parseFloat(api.lastTrade.p)
    var entryPrice = parseFloat(api.positions[0].price)

    var pnl = (price - entryPrice) / entryPrice * qty * price
    var pnlPercent = pnl / api.account.totalWalletBalance
    return { pnl: pnl, percent: pnlPercent }

}

function getBreakEven () {

}


async function getDailyPNL(){
    var incomeHistory
    var currentBalance = +api.account.totalWalletBalance

    var startTime = new Date().setHours(4)
    await api.binance.futuresIncome({symbol: SYMBOL, startTime: startTime, endTime: Date.now()})
        .then(response => incomeHistory = response)
    var PNLarray = incomeHistory.filter(x => x.incomeType == "REALIZED_PNL" && x.symbol == SYMBOL)

    var total = 0
    for (let x of PNLarray){
        total += +x.income
    }
    var oldBalance = currentBalance - total

    return { pnl: total, percent: (total / oldBalance) }


    "BTCUSDT", {orderId: "1025137386"}
}
