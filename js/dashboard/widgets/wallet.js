'use strict'
const api = require('../../apis/futures')
const stats = require('../../data/stats')
const TransferModal = require('../modals/transfer-funds')
const { truncateDecimals } = require('../../snippets')

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

    let format = value => d3.format(',.2f')(truncateDecimals(value, 2))

    let pnl = stats.getPnl()
    let pnlPercent = d3.format(',.1%')(pnl.percent)

    let balance = parseFloat(data.totalWalletBalance)
    let unrealizedBalance = pnl.pnl + balance

    let dailyPnl = await stats.getDailyPnl()
    let dailyPnlPercent = d3.format(',.1%')(dailyPnl.percent)

    let positionMargin = data.totalPositionInitialMargin
    let posMarginPercent = d3.format(',.1%')(positionMargin / balance)

    let orderMargin = data.totalOpenOrderInitialMargin
    let orderMarginPercent = d3.format(',.1%')(orderMargin / balance)

    data = [
        'Balance: ', format(balance),
        'Equity: ', format(unrealizedBalance),
        'Unrealized PNL: ', format(pnl.pnl) + ' (' + pnlPercent + ')',
        'Daily PNL: ', format(dailyPnl.pnl) + ' (' + dailyPnlPercent + ')',
        'Position margin: ', format(positionMargin) + ' (' + posMarginPercent + ')',
        'Order margin: ', format(orderMargin) + ' (' + orderMarginPercent + ')',
    ]

    d3.select('#balances').selectAll('#balances > div')
        .data(data)
        .join(
            enter => enter.append('div').text(d => d)
                .class((d, i) => (i%2) ? 'value' : 'label'),
            update => update.text(d => d)
        )
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   Funds transfer
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
d3.select('#transfer-funds > span')
    .on('click', () => new TransferModal().display())
