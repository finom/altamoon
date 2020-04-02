'use strict'
const api = require('../api-futures')
const stats = require('../stats')

api.onBalancesUpdate.push(updateWallet)
api.onPriceUpdate.push(updateWallet)
setInterval(api.getAccount, 2000)

var accountData

async function updateWallet (data) {
    if (data.assets === undefined)
        data = accountData
    else
        accountData = data

    if(!data) return

    var format = value => d3.format(',.2~f')(value)

    var pnl = stats.getPnl()
    var pnlPercent = d3.format(',.1~%')(pnl.percent)

    var balance = parseFloat(data.totalWalletBalance)
    var unrealizedBalance = pnl.pnl + balance

    var dailyPnl = await stats.getDailyPnl()
    var dailyPnlPercent = d3.format(',.1~%')(dailyPnl.percent)

    data = [
        'Balance: ', format(data.totalWalletBalance),
        'Equity: ', format(unrealizedBalance),
        'Unrealized PNL: ', format(pnl.pnl) + ' (' + pnlPercent + ')',
        'Daily PNL: ', format(dailyPnl.pnl) + ' (' + dailyPnlPercent + ')',
        'Position margin: ', format(data.totalPositionInitialMargin),
        'Order margin: ', format(data.totalOpenOrderInitialMargin)
    ]

    d3.select('#balances').selectAll('#balances > div')
        .data(data)
        .join(
            enter => enter.append('div').text(d => d)
                .attr('class', (d, i) => (i%2) ? 'value' : 'label'),
            update => update.text(d => d)
        )
}
