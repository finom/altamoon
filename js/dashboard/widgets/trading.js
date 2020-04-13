'use strict'
const api = require('../../api-futures')
const { config } = require('../../config')

module.exports = { onBuy, onSell, getMarginCost }

// HTML nodes
let leverageInput = d3.select('[name="leverageInput"]')
let leverageOutput = d3.select('[name="leverageOutput"]')
let orderTypes = d3.selectAll('#order-type input[name="order-type"]')
let orderType = () => d3.select('#order-type input[name="order-type"]:checked')
let buyPrice = d3.select('#buy-price')
let sellPrice = d3.select('#sell-price')
let buyQty = d3.select('#buy-qty')
let sellQty = d3.select('#sell-qty')
let buyDollarValue = d3.select('#trading .buy .dollar-qty .val')
let sellDollarValue = d3.select('#trading .sell .dollar-qty .val')
let buyBtn = d3.select('.buy .btn')
let sellBtn = d3.select('.sell .btn')

// Set events
leverageInput.on('input', onInputLeverage)
leverageInput.on('change', onLeverageChanged)
orderTypes.on('change', onOrderTypeChanged)
buyPrice.on('input', () => onInputPrice('buy'))
sellPrice.on('input', () => onInputPrice('sell'))
buyQty.on('input', () => onInputQty('buy'))
    .on('wheel', () => increment('buy'))
sellQty.on('input', () => onInputQty('sell'))
    .on('wheel', () => increment('sell'))
buyBtn.on('click', onBuy)
sellBtn.on('click', onSell)

events.on('chart.draftOrderMoved', onPriceUpdate)

let leverage
let qty = { 'buy': undefined, 'sell': undefined }

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   ORDER TYPE
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function onOrderTypeChanged () {
    let type = orderType().property('value')
    let tradingDiv = d3.select('#trading')

    if (type == 'limit') {
        tradingDiv.classed('market', false)
        buyBtn.html('BUY')
        sellBtn.html('SELL')
    }
    else if (type == 'market') {
        tradingDiv.classed('market', true)
        buyBtn.html('MARKET BUY')
        sellBtn.html('MARKET SELL')
    }
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   LEVERAGE
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
events.on('api.positionUpdate', updateLeverage)

function updateLeverage (d) {
    let position = d.filter(x => x.symbol == SYMBOL)[0]
    leverage = position.leverage
    leverageInput.property('value', leverage)
    leverageOutput.property('value', leverage)

    events.emit('trading.leverageUpdate', leverage)
    updateMarginCost('buy')
    updateMarginCost('sell')
}

function onInputLeverage () {
    leverage = this.value
    events.emit('trading.leverageUpdate', this.value)
    updateMarginCost('buy')
    updateMarginCost('sell')
}

function onLeverageChanged () {
    leverage = this.value

    api.lib.futuresLeverage(SYMBOL, leverage)
        .catch(err => OUT(err))

    events.emit('trading.leverageUpdate', leverage)
    updateMarginCost('buy')
    updateMarginCost('sell')
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   OPTIONS
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
let reduceOnly = () => d3.select('#reduce-only').property('checked')
let makerOnly = () => d3.select('#maker-only').property('checked')

// Get maker-only from config
d3.select('#maker-only').property('checked', config.get('order.makerOnly'))
// Save maker-only on change
d3.select('#maker-only').on('change', function () {
        config.set({'order.makerOnly': this.checked})
})

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   PRICE
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function onInputPrice (side) {
    let price = parseNumber()
    updateMarginCost(side, price)
    updateDollarValue(side, price)
}

function onPriceUpdate (side, price) {
    if (price === null)
        return
    let input = eval(side + 'Price')
    input.property('value', price)
    updateMarginCost(side, price)
    updateDollarValue(side, price)
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   QUANTITY
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function onInputQty (side) {
    qty[side] = parseNumber()

    events.emit('trading.qtyUpdate', side, qty[side])

    updateMarginCost(side)
    updateDollarValue(side)
}

function updateDollarValue(side, price){
    if (!price)
        price = eval(side + 'Price').property('value')
    if (!qty[side])
        qty[side] = eval(side + 'Qty').property('value')

    let dollarValue = qty[side] * price
    dollarValue = d3.format(',d')(dollarValue)

    eval(side + 'DollarValue')
        .text('± ' + dollarValue + ' ₮')
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   MARGIN COST
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function getMarginCost (side, price) {
    if (!leverage)
        leverage = leverageInput.property('value')
    if (!price)
        price = eval(side + 'Price').property('value')
    if (!qty[side])
        qty[side] = eval(side + 'Qty').property('value')

    return qty[side] * price / leverage
}

function updateMarginCost (side, price) {
    let margin = getMarginCost(side, price)
    margin = d3.format(',.2f')(margin)

    d3.select('#trading .' + side +  ' .margin .val')
        .text(margin + ' ₮')
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   BUY
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function onBuy (type) {
    let price = parseFloat(buyPrice.property('value'))
    let qty = parseFloat(buyQty.property('value'))
    type = (type) ? type : orderType().property('value')

    if (qty <= 0) return

    if (type == 'market') {
        api.lib.futuresMarketBuy(SYMBOL, qty, {
                'reduceOnly': reduceOnly().toString()
            })
            .catch(error => console.error(error))
    }
    else if (price > 0) {
        api.lib.futuresBuy(SYMBOL, qty, price, {
                'timeInForce': (makerOnly()) ? 'GTX' : 'GTC',
                'reduceOnly': reduceOnly().toString()
            })
            .catch(error => console.error(error))
    }
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   SELL
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function onSell (type) {
    let price = parseFloat(sellPrice.property('value'))
    let qty = parseFloat(sellQty.property('value'))
    type = (type) ? type : orderType().property('value')

    if (qty <= 0) return

    if (type == 'market') {
        api.lib.futuresMarketSell(SYMBOL, qty, {
                'reduceOnly': reduceOnly().toString()
            })
            .catch(error => console.error(error))
    }
    else if (price > 0) {
        api.lib.futuresSell(SYMBOL, qty, price, {
                'timeInForce': (makerOnly()) ? 'GTX' : 'GTC',
                'reduceOnly': reduceOnly().toString()
            })
            .catch(error => console.error(error))
    }
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   GENERIC FUNCTIONS
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function parseNumber () {
    let string = event.target.value

    let regex = /[0-9]|\./
    for (let i = 0; i < string.length; i++) {
        if (!regex.test(string[i])) {
            string = string.replace(string[i], '')
            i--
        }
    }
    return event.target.value = string
}

function increment (side) {
    let qty = parseFloat(event.target.value)
    let direction = Math.sign(-event.deltaY)

    qty = (qty + config.get('order.qtyInterval') * direction).toFixed(3)
    event.target.value = Math.max(0, qty)
    onInputQty(side)
}
