'use strict'
const api = require('../../../apis/futures')
const { config } = require('../../../config')
const stats = require('../../../data/stats')
const { parseInputNumber } = require('../../../snippets')


class Trading {

    constructor () {
        this.leverage
        this.qty = { 'buy': undefined, 'sell': undefined }

        // HTML nodes
        this.leverageInput = d3.select('[name="leverageInput"]')
        this.leverageOutput = d3.select('[name="leverageOutput"]')
        this.orderTypes = d3.selectAll('#order-type input[name="order-type"]')
        this.orderType =
            () => d3.select('#order-type input[name="order-type"]:checked')
                    .property('value')
        this.buyPrice = d3.select('#buy-price')
        this.sellPrice = d3.select('#sell-price')
        this.buyQty = d3.select('#buy-qty')
        this.sellQty = d3.select('#sell-qty')
        this.buyDollarValue = d3.select('#trading .buy .dollar-qty .val')
        this.sellDollarValue = d3.select('#trading .sell .dollar-qty .val')
        this.buyBtn = d3.select('.buy .btn')
        this.sellBtn = d3.select('.sell .btn')

        // Set events
        this.leverageInput.on('input', this.onInputLeverage.bind(this))
        this.leverageInput.on('change', this.onLeverageChanged.bind(this))
        this.orderTypes.on('change', this.onOrderTypeChanged.bind(this))
        this.buyPrice.on('input', () => this.onInputPrice('buy'))
        this.sellPrice.on('input', () => this.onInputPrice('sell'))
        this.buyQty.on('input', () => this.onInputQty('buy'))
                   .on('wheel', () => this.increment('buy'))
        this.sellQty.on('input', () => this.onInputQty('sell'))
                    .on('wheel', () => this.increment('sell'))
        this.buyBtn.on('click', this.onBuy.bind(this))
        this.sellBtn.on('click', this.onSell.bind(this))

        events.on('api.positionUpdate', this.updateLeverage.bind(this))
        events.on('chart.draftOrderMoved', this.updatePrice.bind(this))
        events.on('api.priceUpdate', this.updateMarketMarginCost.bind(this))
        events.on('api.priceUpdate', this.updateMarketDollarValue.bind(this))
        events.on('api.priceUpdate', this.updateMarketFee.bind(this))

        // Submit buy/sell on Enter key
        this.buyQty.on('keyup', () => { if (event.keyCode === 13) this.onBuy() })
        this.sellQty.on('keyup', () => { if (event.keyCode === 13) this.onSell() })

        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
        //   OPTIONS
        // ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
        this.reduceOnly = () => d3.select('#reduce-only').property('checked')
        this.makerOnly = () => d3.select('#maker-only').property('checked')

        // Get maker-only from config
        d3.select('#maker-only')
            .property('checked', config.get('order.makerOnly'))
        // Save maker-only on change
        d3.select('#maker-only')
            .on('change', function () {
                config.set({'order.makerOnly': this.checked})
            })
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   ORDER TYPE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    onOrderTypeChanged () {
        let type = this.orderType()
        let tradingDiv = d3.select('#trading')

        if (type == 'limit') {
            tradingDiv.classed('market', false)
            this.buyBtn.html('BUY')
            this.sellBtn.html('SELL')

            this.updateMarginCost('buy')
            this.updateMarginCost('sell')
            this.updateDollarValue('buy')
            this.updateDollarValue('sell')
            this.updateFee('buy')
            this.updateFee('sell')
        }
        else if (type == 'market') {
            tradingDiv.classed('market', true)
            this.buyBtn.html('MARKET BUY')
            this.sellBtn.html('MARKET SELL')
        }
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   LEVERAGE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    updateLeverage (d) {
        this.leverage = api.position.leverage
        this.leverageInput.property('value', this.leverage)
        this.leverageOutput.property('value', this.leverage)

        events.emit('trading.leverageUpdate', this.leverage)
        this.updateMarginCost('buy')
        this.updateMarginCost('sell')
    }

    onInputLeverage () {
        this.leverage = event.target.value
        events.emit('trading.leverageUpdate', event.target.value)
        this.updateMarginCost('buy')
        this.updateMarginCost('sell')
    }

    onLeverageChanged () {
        this.leverage = event.target.value

        api.lib.futuresLeverage(SYMBOL, this.leverage)
            .then(r => api.getPosition())
            .catch(err => OUT(err))

        events.emit('trading.leverageUpdate', this.leverage)
        this.updateMarginCost('buy')
        this.updateMarginCost('sell')
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   PRICE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    onInputPrice (side) {
        let price = parseInputNumber()
        this.updateDollarValue(side, price)
        this.updateMarginCost(side, price)
        this.updateFee(side, price)
    }

    updatePrice (side, price) {
        if (price === null) return

        let input = (side == 'buy') ? this.buyPrice : this.sellPrice
        input.property('value', price)

        this.updateDollarValue(side, price)
        this.updateMarginCost(side, price)
        this.updateFee(side, price)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   QUANTITY
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    onInputQty (side) {
        this.qty[side] = parseInputNumber()

        events.emit('trading.qtyUpdate', this.qty[side], side)

        this.updateDollarValue(side)
        this.updateMarginCost(side)
        this.updateFee(side)
    }

    updateDollarValue (side, price){
        let priceInput = (side == 'buy') ? this.buyPrice : this.sellPrice
        let qtyInput = (side == 'buy') ? this.buyQty : this.sellQty
        let dollarValueSpan = (side == 'buy')
            ? this.buyDollarValue
            : this.sellDollarValue

        if (!price)
            price = priceInput.property('value')
        if (!this.qty[side])
            this.qty[side] = qtyInput.property('value')

        let dollarValue = this.qty[side] * price
        dollarValue = nFormat(',d', dollarValue)

        dollarValueSpan.text('± ' + dollarValue + ' ₮')
    }

    updateMarketDollarValue (price) {
        if (this.orderType() != 'market')
            return

        this.updateDollarValue('buy', price)
        this.updateDollarValue('sell', price)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   MARGIN COST
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    getMarginCost (side, price) {
        let priceInput = (side == 'buy') ? this.buyPrice : this.sellPrice
        let qtyInput = (side == 'buy') ? this.buyQty : this.sellQty

        if (!this.leverage)
            this.leverage = this.leverageInput.property('value')
        if (!price)
            price = priceInput.property('value')
        if (!this.qty[side])
            this.qty[side] = qtyInput.property('value')

        return this.qty[side] * price / this.leverage
    }

    updateMarginCost (side, price) {
        let priceInput = (side == 'buy') ? this.buyPrice : this.sellPrice

        if (!price)
            price = priceInput.property('value')

        let margin = this.getMarginCost(side, price)
        let percentage = margin / api.account.balance
        margin = nFormat(',.2f', margin)
        percentage = nFormat(',.1%', percentage || 0)


        d3.select('#trading .' + side +  ' .margin .val')
            .text(percentage + '  (' + margin + ' ₮)')
    }

    updateMarketMarginCost (price) {
        if (this.orderType() != 'market')
            return

        this.updateMarginCost('buy', price)
        this.updateMarginCost('sell', price)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   FEE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    updateFee (side, price) {
        let priceInput = (side == 'buy') ? this.buyPrice : this.sellPrice
        let qtyInput = (side == 'buy') ? this.buyQty : this.sellQty

        if (!price)
            price = priceInput.property('value')
        if (!this.qty[side])
            this.qty[side] = qtyInput.property('value')

        let value = this.qty[side] * price
        let fee = stats.getFee(value, this.orderType())
        let percentage = fee / api.account.balance

        fee = nFormat(',.2f', fee)
        percentage = nFormat(',.1%', percentage || 0)

        d3.select(`#trading .${side} .fee .val`)
            .text(percentage + `  (${fee} ₮)`)
    }

    updateMarketFee (price) {
        if (this.orderType() != 'market')
            return
        this.updateFee('buy', price)
        this.updateFee('sell', price)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   BUY
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    onBuy (type) {
        let price = parseFloat(this.buyPrice.property('value'))
        let qty = parseFloat(this.buyQty.property('value'))
        type = type | this.orderType()

        if (qty <= 0) return

        if (type == 'market') {
            api.lib.futuresMarketBuy(SYMBOL, qty, {
                    'reduceOnly': this.reduceOnly().toString()
                })
                .catch(error => console.error(error))
        }
        else if (price > 0) {
            api.lib.futuresBuy(SYMBOL, qty, price, {
                    'timeInForce': (this.makerOnly()) ? 'GTX' : 'GTC',
                    'reduceOnly': this.reduceOnly().toString()
                })
                .catch(error => console.error(error))
        }
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   SELL
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    onSell (type) {
        let price = parseFloat(this.sellPrice.property('value'))
        let qty = parseFloat(this.sellQty.property('value'))
        type = type | this.orderType()

        if (qty <= 0) return

        if (type == 'market') {
            api.lib.futuresMarketSell(SYMBOL, qty, {
                    'reduceOnly': this.reduceOnly().toString()
                })
                .catch(error => console.error(error))
        }
        else if (price > 0) {
            api.lib.futuresSell(SYMBOL, qty, price, {
                    'timeInForce': (this.makerOnly()) ? 'GTX' : 'GTC',
                    'reduceOnly': this.reduceOnly().toString()
                })
                .catch(error => console.error(error))
        }
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

module.exports = new Trading()
