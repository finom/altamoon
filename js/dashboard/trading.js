'use strict'
const api = require('../api-futures')
const { config } = require('../config')

module.exports = { onBuy, onSell, parseNumber, getMarginCost }

// HTML nodes
var leverageInput = d3.select('[name="leverageInput"]')
var orderTypes = d3.selectAll('#order-type input[name="order-type"]')
var orderType = () => d3.select('#order-type input[name="order-type"]:checked')
var buyPrice = d3.select('#buy-price')
var sellPrice = d3.select('#sell-price')
var buyQty = d3.select('#buy-qty')
var sellQty = d3.select('#sell-qty')
var buyBtn = d3.select('.buy .btn')
var sellBtn = d3.select('.sell .btn')

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

var leverage
var price
var qty

// -----------------------------------------------------------------------------
//   ORDER TYPE
// -----------------------------------------------------------------------------
function onOrderTypeChanged () {
    var type = orderType().property('value')
    var tradingDiv = d3.select('#trading')

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

// -----------------------------------------------------------------------------
//   LEVERAGE
// -----------------------------------------------------------------------------
api.onPositionUpdate.push(updateLeverage)

function updateLeverage (d) {
    var position = d.filter(x => x.symbol == SYMBOL)[0]
    leverage = position.leverage
    leverageInput.property('value', leverage)
    d3.select('[name="leverageOutput"]').property('value', leverage)
    updateMarginCost('buy')
    updateMarginCost('sell')
}

function onInputLeverage () {
    leverage = this.value
    updateMarginCost('buy')
    updateMarginCost('sell')
}

function onLeverageChanged () {
    leverage = this.value
    api.binance.futuresLeverage(SYMBOL, leverage)
        .catch(err => OUT(err))
    updateMarginCost('buy')
    updateMarginCost('sell')
}

// -----------------------------------------------------------------------------
//   OPTIONS
// -----------------------------------------------------------------------------
var reduceOnly = () => d3.select('#reduce-only').property('checked')
var makerOnly = () => d3.select('#maker-only').property('checked')

// Get maker-only from config
d3.select('#maker-only').property('checked', config.get('order.makerOnly'))
// Save maker-only on change
d3.select('#maker-only').on('change', function () {
        config.set({'order.makerOnly': this.checked})
})

// -----------------------------------------------------------------------------
//   PRICE
// -----------------------------------------------------------------------------
function onInputPrice (side) {
    price = parseNumber()
    updateMarginCost(side)
    updateDollarValue(side)
}

// -----------------------------------------------------------------------------
//   QUANTITY
// -----------------------------------------------------------------------------
function onInputQty (side) {
    qty = parseNumber()
    var draft = chart.draftLinesData[0]

    // Update qty on order draft line
    if (draft && side == draft.side) {
        draft.qty = Number(qty)
        chart.draw()
    }
    updateMarginCost(side)
    updateDollarValue(side)
}

function updateDollarValue(side){
    if (!price)
        price = d3.select('#' + side +  '-price').property('value')
    if (!qty)
        qty = d3.select('#' + side +  '-qty').property('value')

    var dollarValue = qty * price
    dollarValue = d3.format(',d')(dollarValue)

    d3.select('#trading .' + side +  ' .dollar-qty .val')
        .text('± ' + dollarValue + ' ₮')
}

// -----------------------------------------------------------------------------
//   MARGIN COST
// -----------------------------------------------------------------------------
function getMarginCost (side) {
    if (!leverage)
        leverage = leverageInput.property('value')
    if (!price)
        price = d3.select('#' + side +  '-price').property('value')
    if (!qty)
        qty = d3.select('#' + side +  '-qty').property('value')

    return qty * price / leverage
}

function updateMarginCost (side) {
    var margin = getMarginCost(side)
    margin = d3.format(',.2f')(margin)

    d3.select('#trading .' + side +  ' .margin .val')
        .text(margin + ' ₮')
}

// -----------------------------------------------------------------------------
//   BUY
// -----------------------------------------------------------------------------
function onBuy (type) {
    var price = parseFloat(buyPrice.property('value'))
    var qty = parseFloat(buyQty.property('value'))
    type = (type) ? type : orderType().property('value')

    if (qty <= 0) return

    if (type == 'market') {
        api.binance.futuresMarketBuy(SYMBOL, qty, {
                'reduceOnly': reduceOnly().toString()
            })
            .catch(error => console.error(error))
    }
    else if (price > 0) {
        api.binance.futuresBuy(SYMBOL, qty, price, {
                'timeInForce': (makerOnly()) ? 'GTX' : 'GTC',
                'reduceOnly': reduceOnly().toString()
            })
            .catch(error => console.error(error))
    }
}

// -----------------------------------------------------------------------------
//   SELL
// -----------------------------------------------------------------------------
function onSell (type) {
    var price = parseFloat(sellPrice.property('value'))
    var qty = parseFloat(sellQty.property('value'))
    type = (type) ? type : orderType().property('value')

    if (qty <= 0) return

    if (type == 'market') {
        api.binance.futuresMarketSell(SYMBOL, qty, {
                'reduceOnly': reduceOnly().toString()
            })
            .catch(error => console.error(error))
    }
    else if (price > 0) {
        api.binance.futuresSell(SYMBOL, qty, price, {
                'timeInForce': (makerOnly()) ? 'GTX' : 'GTC',
                'reduceOnly': reduceOnly().toString()
            })
            .catch(error => console.error(error))
    }
}

// -----------------------------------------------------------------------------
//   GENERIC FUNCTIONS
// -----------------------------------------------------------------------------
function parseNumber () {
    var string = event.target.value

    var regex = /[0-9]|\./
    for (let i = 0; i < string.length; i++) {
        if (!regex.test(string[i])) {
            string = string.replace(string[i], '')
            i--
        }
    }
    return event.target.value = string
}

function increment (side) {
    var qty = parseFloat(event.target.value)
    qty = (qty + 0.5 * Math.sign(-event.deltaY)).toFixed(3)
    event.target.value = Math.max(0, qty)
    onInputQty(side)
}
