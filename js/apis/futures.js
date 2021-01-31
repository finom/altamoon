/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

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
    get exchangeInfo() { return cache.exchangeInfo }
    set exchangeInfo(value) { cache.exchangeInfo = value }

    get account() { return cache.account }
    set account(value) { cache.account = value }

    get positions() { return cache.positions }
    set positions(value) { cache.positions = value }

    get position() { return cache.position }
    set position(value) { cache.position = value }

    get openOrders() { return cache.openOrders }
    set openOrders(value) { cache.openOrders = value }

    get lastTrade() { return cache.lastTrade }
    set lastTrade(value) { cache.lastTrade = value }

    get lastPrice() { return cache.lastPrice }
    set lastPrice(value) { cache.lastPrice = value }

    // GET methods
    getCandles = (params) => rest.getCandles(params)
    getAccount = () => rest.getAccount()
    getExchangeInfo = () => rest.getExchangeInfo()
    getOpenOrders = () => rest.getOpenOrders()
    getPosition = () => rest.getPosition()
    getPositionTrades = () => rest.getPositionTrades()

    // PUT methods
    cancelOrder = (id) => rest.cancelOrder(id)
    closePosition = () => rest.closePosition()

    // STREAM (WEBSOCKET) methods
    streamBook = () => ws.streamBook()
    streamBidAsk = () => ws.streamBidAsk()
    streamLastTrade = () => ws.streamLastTrade()
    streamUserData = () => ws.streamUserData()
    streamLastCandle = (...args) => ws.streamLastCandle(...args)
    terminateStream = (...args) => ws.terminateStream(...args)
}

module.exports = new ApiFutures()
