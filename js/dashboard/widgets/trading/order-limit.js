'use strict'
const {Order} = require('./order')

class OrderLimit extends Order {

    constructor () {
        super()
        this.orderType = 'limit'
    }
}

module.exports = { OrderLimit }
