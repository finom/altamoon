'use strict'
const api = require('../../api-futures')
const stats = require('../../data/stats')

events.on('api.balancesUpdate', updateWallet)
events.on('api.priceUpdate', updateWallet)
setInterval(api.getAccount, 2000)

let accountData

async function updateWallet (data) {
    if (data.assets === undefined)
        data = accountData
    else
        accountData = data

    if(!data) return

    let format = value => d3.format(',.2f')(value)

    let pnl = stats.getPnl()
    let pnlPercent = d3.format(',.1%')(pnl.percent)

    let balance = parseFloat(data.totalWalletBalance)
    let unrealizedBalance = pnl.pnl + balance

    let dailyPnl = await stats.getDailyPnl()
    let dailyPnlPercent = d3.format(',.1%')(dailyPnl.percent)

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
