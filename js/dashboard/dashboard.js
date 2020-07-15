'use strict'
require ('../globals')
const settings = require('../../user/settings')
const api = require('../apis/futures')

const Gridstack = require('./gridstack')

const Chart = require('./widgets/chart/chart')
const trading = require('./widgets/trading')
const book = require('./widgets/book')
require('./widgets/my-orders')
require('./widgets/wallet')
require('./widgets/trades')
require('../data/liquidation')

// Draw chart
new Gridstack('#main-grid')
new Chart('#chart')

// Get initial data
api.getExchangeInfo()
api.getPosition()
api.getOpenOrders()
api.getAccount()
// Open websocket streams
api.streamLastCandle()
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
