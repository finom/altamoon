'use strict'
const fs = require('fs')
const api = require('../../../apis/futures')
const {config} = require('../../../config')
const stats = require('../../../data/stats')
const {parseInputNumber} = require('../../../snippets')
const data = require('./data')


class Order {

    constructor () {
        this.container = d3.select('#order')
    }

    buildUI () {
        fs.readFile('./html/trading/order.html', 'utf8',
            (err, data) => {
                if (err) throw err
                this.container.class('#order ' + this.orderType)
                this._addHTML(data)
                this._addEventListeners()
                this.updateUIData()
            }
        )
    }

    _addHTML (html) {
        this.container.html('') // Clear (not sure if necessary)
        this.container.html(html)

        this.tradingDiv = d3.select('#trading')
        this.leverageInput = d3.select('[name="leverageInput"]')
        this.leverageOutput = d3.select('[name="leverageOutput"]')
        this.reduceOnly = d3.select('#reduce-only')
        this.postOnly = d3.select('#post-only')
        this.buyQty = d3.select('#buy-qty')
        this.sellQty = d3.select('#sell-qty')
        this.buyDollarValue = d3.select('#trading .buy .dollar-qty .val')
        this.sellDollarValue = d3.select('#trading .sell .dollar-qty .val')
        this.buyBtn = d3.select('.buy .btn')
        this.sellBtn = d3.select('.sell .btn')
    }

    _addEventListeners () {
        this.leverageInput.on('input', this.onInputLeverage.bind(this))
        this.leverageInput.on('change', this.onLeverageChanged.bind(this))
        this.reduceOnly.on('change', this.onReduceOnlyChanged.bind(this))
        this.postOnly.on('change', this.onPostOnlyChanged.bind(this))
        this.buyQty.on('input', () => this.onInputQty('buy'))
                   .on('wheel', () => this.increment('buy'))
        this.sellQty.on('input', () => this.onInputQty('sell'))
                    .on('wheel', () => this.increment('sell'))
        this.buyBtn.on('click', () => this.onBuySell('buy'))
        this.sellBtn.on('click', () => this.onBuySell('sell'))

        this.onPositionUpdate = this.updateLeverage.bind(this)
        events.on('api.positionUpdate', this.onPositionUpdate)

        this.onDraftOrderMoved = this.updatePrice.bind(this)
        events.on('chart.draftOrderMoved', this.onDraftOrderMoved)

        // Update base min qty
        events.once('api.exchangeInfoUpdate', () => this.updateUIData())

        // Submit buy/sell on Enter key
        this.buyQty.on('keyup', () => {
            if (event.keyCode === 13) this.onBuySell('buy')
        })
        this.sellQty.on('keyup', () => {
            if (event.keyCode === 13) this.onBuySell('sell')
        })
    }

    updateUIData () {
        this.updateLeverage()

        this.postOnly.property('checked', data.postOnly)
        this.reduceOnly.property('checked', data.reduceOnly)

        this.updatePrice('buy', data.price['buy'])
        this.updatePrice('sell', data.price['sell'])

        this.buyQty.value(data.qty['buy'])
        this.sellQty.value(data.qty['sell'])
    }

    cleanupBeforeRemoval () {
        events.off('api.positionUpdate', this.onPositionUpdate)
        events.off('chart.draftOrderMoved', this.onDraftOrderMoved)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   LEVERAGE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    updateLeverage () {
        data.leverage = api.position.leverage
        this.leverageInput.value(data.leverage)
        this.leverageOutput.value(data.leverage)

        events.emit('trading.leverageUpdate', data.leverage)
        this.updateMarginCost('buy')
        this.updateMarginCost('sell')
    }

    onInputLeverage () {
        data.leverage = event.target.value
        events.emit('trading.leverageUpdate', data.leverage)
        this.updateMarginCost('buy')
        this.updateMarginCost('sell')
    }

    onLeverageChanged () {
        data.leverage = event.target.value

        api.lib.futuresLeverage(SYMBOL, data.leverage)
            .then(r => api.getPosition())
            .catch(err => OUT(err))

        events.emit('trading.leverageUpdate', data.leverage)
        this.updateMarginCost('buy')
        this.updateMarginCost('sell')
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   OPTIONS
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    onReduceOnlyChanged () {
        data.reduceOnly = event.target.checked
        config.set({'order.reduceOnly': data.reduceOnly})
    }

    onPostOnlyChanged () {
        data.postOnly = event.target.checked
        config.set({'order.postOnly': data.postOnly})
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   PRICE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    updatePrice (side, price) {
        if (price === null) return

        data.price[side] = price
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   QUANTITY
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    onInputQty (side) {
        data.qty[side] = parseInputNumber()

        events.emit('trading.qtyUpdate', data.qty[side], side)

        this.updateDollarValue(side)
        this.updateMarginCost(side)
        this.updateFee(side)
    }

    updateDollarValue (side, price){
        let dollarValueSpan = (side == 'buy')
            ? this.buyDollarValue
            : this.sellDollarValue

        price = price || data.price[side] || 0

        let dollarValue = data.qty[side] * price
        dollarValue = nFormat(',d', dollarValue)

        dollarValueSpan.text('± ' + dollarValue + ' ₮')
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   MARGIN COST
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    getMarginCost (side, price) {
        price = price || data.price[side] || 0

        return data.qty[side] * price / data.leverage
    }

    updateMarginCost (side, price) {
        price = price || data.price[side] || 0

        let margin = this.getMarginCost(side, price)
        let percentage = margin / api.account.balance
        margin = nFormat(',.2f', margin)
        percentage = nFormat(',.1%', percentage || 0)


        d3.select('#trading .' + side +  ' .margin .val')
            .text(percentage + '  (' + margin + ' ₮)')
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   FEE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    updateFee (side, price) {
        price = price || data.price[side] || 0

        let value = data.qty[side] * price
        let fee = stats.getFee(value, this.orderType)
        let percentage = fee / api.account.balance

        fee = nFormat(',.2f', fee)
        percentage = nFormat(',.1%', percentage || 0)

        d3.select(`#trading .${side} .fee .val`)
            .text(percentage + `  (${fee} ₮)`)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   BUY / SELL
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    onBuySell (side) {
        if (data.qty[side] <= 0)
            return
        this.sendOrder(side, data.qty[side])
    }

    sendOrder (side, qty) {
        // Implement in subclass
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   GENERIC FUNCTIONS
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    increment (side) {
        let qty = parseFloat(event.target.value)
        let direction = Math.sign(-event.deltaY)

        qty = (qty + config.get('order.qtyInterval') * direction).toFixed(3)
        event.target.value = Math.max(0, qty)
        this.onInputQty(side)
    }
}

module.exports = { Order }
