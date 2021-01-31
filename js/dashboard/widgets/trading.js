/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'
const {OrderLimit} = require('./trading/order-limit')
const {OrderMarket} = require('./trading/order-market')
const {OrderStopLimit} = require('./trading/order-stop-limit')
const {OrderStopMarket} = require('./trading/order-stop-market')
const {OrderTrailingStop} = require('./trading/order-trailing')


class Trading {

    constructor () {
        this.orderTypes = d3.selectAll('#order-type input[name="order-type"]')
        this.orderType =
            () => d3.select('#order-type input[name="order-type"]:checked')
                    .property('value')

        this.orderTypes.on('change', this._onOrderTypeChanged.bind(this))

        this.order = new OrderLimit()
        this.order.buildUI()
    }

    _onOrderTypeChanged (type) {
        type = type || event.target.value

        this.order.cleanupBeforeRemoval()

        this.order = (type === 'limit') ? new OrderLimit()
                : (type === 'market') ? new OrderMarket()
                : (type === 'stop') ? new OrderStopLimit()
                : (type === 'stop-market') ? new OrderStopMarket()
                : (type === 'trailing-stop') ? new OrderTrailingStop()
                : console.error('Invalid order type')

        this.order.buildUI()
    }
}

module.exports = new Trading()
