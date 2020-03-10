'use strict'
const { binance } = require('../api-futures')
const chart = require('./chart')

module.exports = { onMarketOrderToggled, onBuy, onSell, forceNumInput }

var marketCheckbox = d3.select('#market-order')
var buyBtn = d3.select('.buy .btn')
var sellBtn = d3.select('.sell .btn')
var buyQty = d3.select('.buy .qty')
var sellQty = d3.select('.sell .qty')

marketCheckbox.on('change', onMarketOrderToggled)
buyQty.on('input', () => onChangeQty('buy'))
    .on('wheel', increment)
sellQty.on('input', () => onChangeQty('sell'))
    .on('wheel', increment)
buyBtn.on('click', onBuy)
sellBtn.on('click', onSell)

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

    if (!(qty > 0)) return

    if (market) {
        binance.futuresMarketBuy('BTCUSDT', qty)
            .catch(error => console.error(error))
    }
    else if (price > 0) {
        binance.futuresBuy('BTCUSDT', qty, price, {'timeInForce': 'GTX'})
            .catch(error => console.error(error))
    }
}

function onSell () {
    var price = parseFloat(d3.select('.sell .price').property('value'))
    var qty = parseFloat(sellQty.property('value'))
    var market = marketCheckbox.property('checked')

    if (!(qty > 0)) return

    if (market) {
        binance.futuresMarketSell('BTCUSDT', qty)
            .catch(error => console.error(error))
    }
    else if (price > 0) {
        binance.futuresSell('BTCUSDT', qty, price, {'timeInForce': 'GTX'})
            .catch(error => console.error(error))
    }
}

function onChangeQty (side) {
    var qty = forceNumInput()
    var draft = chart.draftLinesData[0]

    if (draft && side == draft.side) {
        chart.draftLinesData[0].qty = Number(qty)
        chart.draw()
    }
}

function forceNumInput () {
    var text = event.target.value
    var regex = /[0-9]|\./
    for (let i = 0; i < text.length; i++) {
        if (!regex.test(text[i])) {
            text = text.replace(text[i], '')
            i--
        }
    }
    return event.target.value = text
}

function increment () {
    var qty = parseFloat(this.value)
    qty = (qty + 0.1 * Math.sign(-event.deltaY)).toFixed(1)
    this.value = Math.max(0, qty)
    onChangeQty(this.parentNode.className)
}
