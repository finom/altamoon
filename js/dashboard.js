'use strict'
var d3 = require('d3')

var OUT = console.log // Haaa :D

var symbol = 'BTCUSDT'

const api = require('./js/api-futures')
const chart = require('./js/dashboard/chart')
const trading = require('./js/dashboard/trading')
const myOrders = require('./js/dashboard/my-orders')
const wallet = require('./js/dashboard/wallet')

// Get initial data
api.getPosition()
api.getOpenOrders()
api.getAccount()
api.streamLastTrade()
api.streamUserData()
api.streamBidAsk()

// Inputs
d3.selectAll('.num-input').on('input', trading.forceNumInput)
