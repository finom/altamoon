'use strict'
require ('../globals')
const settings = require('../../user/settings')

const api = require('../api-futures')
const chart = require('./widgets/chart')
const trading = require('./widgets/trading')
const myOrders = require('./widgets/my-orders')
const wallet = require('./widgets/wallet')
const book = require('./widgets/book')
const trades = require('./widgets/trades')
const liquidation = require('../data/liquidation')

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
