const fapi = require('../fapi')

fapi.onBalancesUpdate.push(updateWallet)

function updateWallet (data) {OUT(data)
    var bal = d3.select('#balances')
    var usdformat = x => d3.format(',.2~f')(x) + ' ₮'
    bal.html('Balance: ' + usdformat(data.totalWalletBalance)
        + '<br>Unrealized balance: ???'
        + '<br>Position margin: ' + usdformat(data.totalPositionInitialMargin)
        + '<br>Order margin: ' + usdformat(data.totalOpenOrderInitialMargin))
}
