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
