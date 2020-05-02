'use strict'
const api = require('../apis/futures')

module.exports = { getFee, getPnl, getDailyPnl }

function getBreakEven () {
    // TODO
}

function getFee (qty, type = 'limit') {
    let feeTier = api.account.feeTier || 0
    let feeRate = (type === 'market')
        ? [.04, .04, .035, .032, .03, .027, .025, .022, .020, 0.017][feeTier]
        : [.02, .016, .014, .012, .01, .008, .006, .004, .002, 0][feeTier]

    return qty * feeRate / 100
}

function getPnl () {
    if (!api.positions[0] || api.positions[0].qty == 0)
        return {pnl: 0, percent: 0}

    let qty = api.positions[0].qty
    let price = parseFloat(api.lastTrade.p)
    let entryPrice = parseFloat(api.positions[0].price)
    let fee = getFee(qty, 'limit')

    let pnl = (price - entryPrice) / entryPrice * qty * price - fee
    return {
        pnl: pnl || 0,
        percent: pnl / api.account.totalWalletBalance || 0
    }
}

let timer
let incomeHistory = []

async function getDailyPnl () {
    let currentBalance = api.account.totalWalletBalance

    // Throttle api calls
    if (!timer || Date.now() > timer + 5 * 1000) {
        timer = Date.now()
        // Get all balance modifying events since 4am
        let response = await api.lib.futuresIncome({
                symbol: SYMBOL,
                startTime: new Date().setHours(4),
                endTime: Date.now(),
                limit: 1000
            })
            .catch(err => {
                if (err.code == 'ETIMEDOUT')
                    console.warn('Warning: futuresIncome() request timed out')
            })

        if (Array.isArray(response))
            incomeHistory = response
            if (incomeHistory.length >= 999)
                console.warn('Income history request reached limit :(')
    }

    let pnlArray = incomeHistory.filter(
        x => x.incomeType == 'REALIZED_PNL' && x.symbol == SYMBOL
    )
    let feesArray = incomeHistory.filter(
        x => x.incomeType == 'COMMISSION' && x.symbol == SYMBOL
    )
    let fundingArray = incomeHistory.filter(
        x => x.incomeType == 'FUNDING_FEE' && x.symbol == SYMBOL
    )

    let totalPnl = 0
    for (let x of pnlArray)
        totalPnl += +x.income

    let totalFee = 0
    for (let x of feesArray)
        totalFee += +x.income

    let totalFunding = 0
    for (let x of fundingArray)
        totalFunding += +x.income

    totalPnl += totalFee + totalFunding

    let oldBalance = currentBalance - totalPnl

    return {
        pnl: totalPnl,
        percent: totalPnl / oldBalance
    }
}
