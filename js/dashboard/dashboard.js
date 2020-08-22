'use strict'
require ('../globals')
const settings = require('../../user/settings')
const api = require('../apis/futures')
const { config } = require('../config')

const Gridstack = require('./gridstack')

const Chart = require('./widgets/chart/chart')
const book = require('./widgets/book')
require('./widgets/trading/trading')
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
api.streamLastCandle(config.get('chart.interval'))
api.streamLastTrade()
api.streamUserData()
api.streamBidAsk()
api.streamBook()
book.updateBook()

// Inject custom CSS
for (let url of settings.customCss) {
    let link = document.createElement('link')
    link.href = url
    link.type = 'text/css'
    link.rel = 'stylesheet'
    document.getElementsByTagName('head')[0].appendChild(link)
}
