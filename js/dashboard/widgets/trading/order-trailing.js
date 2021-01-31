/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'
const {Order} = require('./order')


class OrderTrailingStop extends Order {

    constructor () {
        super()
        this.orderType = 'trailing-stop'
    }

    _addHTML (html) {
        this.container.html('')
        this.container.append('div')
            .html('Coming soon')
            .style('text-align', 'center')
            .style('margin-top', '100px')
    }

    _addEventListeners () {
    }

    updateUIData () {
    }

    cleanupBeforeRemoval () {
    }
}

module.exports = { OrderTrailingStop }
