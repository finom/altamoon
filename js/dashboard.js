'use strict'

require ('./js/globals')

const api = require('./js/api-futures')
const chart = require('./js/dashboard/chart')
const trading = require('./js/dashboard/trading')
const myOrders = require('./js/dashboard/my-orders')
const wallet = require('./js/dashboard/wallet')
const book = require('./js/dashboard/book')
const trades = require('./js/dashboard/trades')

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
