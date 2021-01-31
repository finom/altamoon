/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'

let _exchangeInfo = {}
let _account = {}
let _positions = []
let _position = {}
let _openOrders = []
let _lastTrade = {}
let _lastPrice

module.exports = {
    get exchangeInfo() { return _exchangeInfo },
    set exchangeInfo(value) { _exchangeInfo = value },

    get account() { return _account },
    set account(value) { _account = value },

    get positions() { return _positions },
    set positions(value) { _positions = value },

    get position() { return _position },
    set position(value) { _position = value },

    get openOrders() { return _openOrders },
    set openOrders(value) { _openOrders = value },

    get lastTrade() { return _lastTrade },
    set lastTrade(value) { _lastTrade = value },

    get lastPrice() { return _lastPrice },
    set lastPrice(value) { _lastPrice = value },
}
