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

leverageInput.on('change', onLeverageChanged)
marketCheckbox.on('change', onMarketOrderToggled)
buyPrice.on('input', () => onChangePrice('buy'))
sellprice.on('input', () => onChangePrice('sell'))
buyQty.on('input', () => onChangeQty('buy'))
    .on('wheel', increment)
sellQty.on('input', () => onChangeQty('sell'))
    .on('wheel', increment)
buyBtn.on('click', onBuy)
sellBtn.on('click', onSell)

function updateLeverage (d) {
    var position = d.filter(x => x.symbol == SYMBOL)[0]
    leverageInput.property('value', position.leverage)
    d3.select('[name="leverageOutput"]').property('value', position.leverage)
}

function onLeverageChanged () {
    api.binance.futuresLeverage(SYMBOL, this.value)
        .catch(err => OUT(err))
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

function onChangePrice (side) {
    var price = parseNumber()
    updateMarginCost({price: price}, side)
    updateDollarValue(side)
}

function onChangeQty (side) {
    var qty = parseNumber()
    var draft = chart.draftLinesData[0]

    // Update qty on order draft line
    if (draft && side == draft.side) {
        chart.draftLinesData[0].qty = Number(qty)
        chart.draw()
    }

    updateMarginCost({qty: event.target.value}, side)
    updateDollarValue(side)
}

function updateDollarValue(side){
    var qty = d3.select('#trading .' + side +  ' .qty').property('value')
    var dollarValue = d3.select('#trading .' + side +  ' .price').property('value')
    var quantityDollarValue = qty * dollarValue

    d3.select('#trading .' + side +  ' .dollar-qty .val')
        .text(quantityDollarValue.toFixed(2) + ' $')
}

function updateMarginCost ({price, qty, leverage}, side) {
    if (!price)
        price = d3.select('#trading .' + side +  ' .price').property('value')
    if (!qty)
        qty = d3.select('#trading .' + side +  ' .qty').property('value')
    var leverage = 25
    var margin = qty * price / leverage

    d3.select('#trading .' + side +  ' .margin .val')
        .text(margin.toFixed(2) + ' ₮')
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
    onChangeQty(this.parentNode.className)
}
