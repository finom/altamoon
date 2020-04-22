'use strict'
const Lib = require('node-binance-api')
const settings = require('../../user/settings')
const Rest = require('./futures/rest')
const Ws = require('./futures/websocket')
const cache = require('./futures/cache')

const lib = new Lib()
lib.options({ APIKEY: settings.apiKey, APISECRET: settings.apiSecret })

const rest = new Rest(lib)
const ws = new Ws(lib, rest)


class ApiFutures {

    lib = lib
    rest = rest
    ws = ws

    // CACHED DATA
    get account() { return cache.account }
    set account(value) { cache.account = value }

    get positions() { return cache.positions }
    set positions(value) { cache.positions = value }

    get openOrders() { return cache.openOrders }
    set openOrders(value) { cache.openOrders = value }

    get lastTrade() { return cache.lastTrade }
    set lastTrade(value) { cache.lastTrade = value }

    get lastPrice() { return cache.lastPrice }
    set lastPrice(value) { cache.lastPrice = value }

    // GET
    getAccount () { rest.getAccount() }
    getOpenOrders () { rest.getOpenOrders() }
    getPosition () { rest.getPosition() }

    //  PUT
    cancelOrder (id) { rest.cancelOrder(id) }
    closePosition () { rest.closePosition() }

    // STREAM (WEBSOCKET)
    streamBook () { ws.streamBook() }
    streamBidAsk () { ws.streamBidAsk() }
    streamLastTrade () { ws.streamLastTrade() }
    streamUserData () { ws.streamUserData() }
}

module.exports = new ApiFutures()
