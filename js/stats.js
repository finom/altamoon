'use strict'
const api = require('./api-futures')

module.exports = { getPnl, getDailyPnl, getLiquidation }

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
var incomeHistory = []

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
            .catch(err => {
                if (err.code == 'ETIMEDOUT')
                    console.warn('Warning: futuresIncome() request timed out')
            })

        if (Array.isArray(response))
            incomeHistory = response
    }

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

function getLiquidation (balance, direction, entryPrice, qty) {
    // https://binance.zendesk.com/hc/en-us/articles/360037941092-How-to-Calculate-Liquidation-Price

    // var balance         // = Margin in isolated mode
    // var direction       // 1 (buy) or -1 (sell)
    // var entryPrice
    // var qty             // in BTC (or other coin)
    var maintenance

    var position = direction * qty * entryPrice

    var maintenanceTable = [
        // Max position ($k), Maintenance rate, Maintenance amount ($)
        [50, 0.004, 0],
        [250, 0.005, 50],
        [1000, 0.01, 1300],
        [5000, 0.025, 16300],
        [10000, 0.05, 141300],
        [20000, 0.1, 641300],
        [35000, 0.125, 1141300],
        [50000, 0.15, 2016300],
        [9999999999999, 0.25, 7016300]
    ]
    for (let x of maintenanceTable)
        if (qty * entryPrice < x[0] * 1000) {
            maintenance = { rate: x[1], amount: x[2] }
            break
        }    

    return (balance + maintenance.amount - position) 
            / (qty * (maintenance.rate - direction))
}
