'use strict'

let _account = {}
let _positions = []
let _openOrders = []
let _lastTrade = {}
let _lastPrice

module.exports = {
    get account() { return _account },
    set account(value) { _account = value },

    get positions() { return _positions },
    set positions(value) { _positions = value },

    get openOrders() { return _openOrders },
    set openOrders(value) { _openOrders = value },

    get lastTrade() { return _lastTrade },
    set lastTrade(value) { _lastTrade = value },

    get lastPrice() { return _lastPrice },
    set lastPrice(value) { _lastPrice = value },
}
