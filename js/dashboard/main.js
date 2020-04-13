'use strict'
require ('./js/globals')
const settings = require('./user/settings')

const api = require('./js/api-futures')
const chart = require('./js/dashboard/widgets/chart')
const trading = require('./js/dashboard/widgets/trading')
const myOrders = require('./js/dashboard/widgets/my-orders')
const wallet = require('./js/dashboard/widgets/wallet')
const book = require('./js/dashboard/widgets/book')
const trades = require('./js/dashboard/widgets/trades')
const liquidation = require('./js/data/liquidation')

// Get initial data
api.getPosition()
api.getOpenOrders()
api.getAccount()
api.streamLastTrade()
api.streamUserData()
api.streamBidAsk()
api.streamBook()
book.updateBook()

// Inputs
d3.selectAll('.num-input').on('input', trading.parseNumber)

// Inject custom CSS
for (let url of settings.customCss) {
    let link = document.createElement('link')
    link.href = url
    link.type = 'text/css'
    link.rel = 'stylesheet'
    document.getElementsByTagName('head')[0].appendChild(link)
}
