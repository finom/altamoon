'use strict'
const api = require('../api-futures')
const chart = require('./chart')

module.exports = { onMarketOrderToggled, onBuy, onSell, parseNumber }

api.onPositionUpdate.push(updateLeverage)

var leverageInput = d3.select('[name="leverageInput"]')
var marketCheckbox = d3.select('#market-order')
var buyPrice = d3.select('.buy .price')
var sellprice = d3.select('.sell .price')
var buyQty = d3.select('.buy .qty')
var sellQty = d3.select('.sell .qty')
var buyBtn = d3.select('.buy .btn')
var sellBtn = d3.select('.sell .btn')

leverageInput.on('input', onInputLeverage)
leverageInput.on('change', onLeverageChanged)
marketCheckbox.on('change', onMarketOrderToggled)
buyPrice.on('input', () => onInputPrice('buy'))
sellprice.on('input', () => onInputPrice('sell'))
buyQty.on('input', () => onInputQty('buy'))
    .on('wheel', increment)
sellQty.on('input', () => onInputQty('sell'))
    .on('wheel', increment)
buyBtn.on('click', onBuy)
sellBtn.on('click', onSell)

var leverage
var price
var qty

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

function onMarketOrderToggled () {
    var tradingDiv = d3.select('#trading')

    if (event.target.checked) {
        tradingDiv.classed('market', true)
        buyBtn.html('MARKET BUY')
        sellBtn.html('MARKET SELL')
    } else {
        tradingDiv.classed('market', false)
        buyBtn.html('BUY')
        sellBtn.html('SELL')
    }
}

function onInputPrice (side) {
    price = parseNumber()
    updateMarginCost(side)
    updateDollarValue(side)
}

function onInputQty (side) {
    qty = parseNumber()
    var draft = chart.draftLinesData[0]

    // Update qty on order draft line
    if (draft && side == draft.side) {
        chart.draftLinesData[0].qty = Number(qty)
        chart.draw()
    }
    updateMarginCost(side)
    updateDollarValue(side)
}

function updateDollarValue(side){
    if (!qty)
        qty = d3.select('#trading .' + side +  ' .qty').property('value')
    if (!price)
        price = d3.select('#trading .' + side +  ' .price').property('value')
    var dollarValue = qty * price

    d3.select('#trading .' + side +  ' .dollar-qty .val')
        .text(dollarValue.toFixed(2) + ' $')
}

function updateMarginCost (side) {
    if (!leverage)
        leverage = leverageInput.property('value')
    if (!price)
        price = d3.select('#trading .' + side +  ' .price').property('value')
    if (!qty)
        qty = d3.select('#trading .' + side +  ' .qty').property('value')
    var margin = qty * price / leverage

    d3.select('#trading .' + side +  ' .margin .val')
        .text(margin.toFixed(2) + ' ₮')
}

function onBuy () {
    var price = parseFloat(d3.select('.buy .price').property('value'))
    var qty = parseFloat(buyQty.property('value'))
    var market = marketCheckbox.property('checked')

    if (qty <= 0) return

    if (market) {
        api.binance.futuresMarketBuy(SYMBOL, qty)
            .catch(error => console.error(error))
    }
    else if (price > 0) {
        api.binance.futuresBuy(SYMBOL, qty, price, {'timeInForce': 'GTX'})
            .catch(error => console.error(error))
    }
}

function onSell () {
    var price = parseFloat(d3.select('.sell .price').property('value'))
    var qty = parseFloat(sellQty.property('value'))
    var market = marketCheckbox.property('checked')

    if (qty <= 0) return

    if (market) {
        api.binance.futuresMarketSell(SYMBOL, qty)
            .catch(error => console.error(error))
    }
    else if (price > 0) {
        api.binance.futuresSell(SYMBOL, qty, price, {'timeInForce': 'GTX'})
            .catch(error => console.error(error))
    }
}

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

function increment () {
    var qty = parseFloat(this.value)
    qty = (qty + 0.05 * Math.sign(-event.deltaY)).toFixed(3)
    this.value = Math.max(0, qty)
    onInputQty(this.parentNode.className)
}
