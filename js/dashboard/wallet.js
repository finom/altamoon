const api = require('../api-futures')

api.onBalancesUpdate.push(updateWallet)
api.onPriceUpdate.push(updateWallet)

var accountData

function updateWallet (data) {
    if (data.assets == undefined) data = accountData
    else accountData = data

    var bal = d3.select('#balances')
    var format = (value, symbol) => d3.format(',.2~f')(value) + ' ₮'

    var balance = parseFloat(data.totalWalletBalance)
    var pnl = api.getPNL()
    var pnlPercent = d3.format(',.2~%')(pnl / balance)
    var unrealizedBalance = pnl + balance

    bal.html('Balance: ' + format(data.totalWalletBalance)
        + '<br>PNL: ' + format(pnl) + ' (' + pnlPercent + ')'
        + '<br>Unrealized balance: ' + format(unrealizedBalance)
        + '<br>Position margin: ' + format(data.totalPositionInitialMargin)
        + '<br>Order margin: ' + format(data.totalOpenOrderInitialMargin))
}
