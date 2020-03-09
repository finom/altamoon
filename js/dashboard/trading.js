'use strict'
const { binance } = require('../api-futures')
const chart = require('./chart')

module.exports = { onMarketOrderToggled, onBuy, onSell, forceNumInput }

d3.select('#buy-amount').on('input', () => onChangeAmount('buy'))
d3.select('#sell-amount').on('input', () => onChangeAmount('sell'))
d3.select('#market-order').on('change', onMarketOrderToggled)
d3.select('#buy').on('click', onBuy)
d3.select('#sell').on('click', onSell)

function onMarketOrderToggled () {
    var tradingDiv = d3.select('#trading')
    var buyBtn = d3.select('#buy')
    var sellBtn = d3.select('#sell')

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
    var price = parseFloat(d3.select('#buy-price').property('value'))
    var amount = parseFloat(d3.select('#buy-amount').property('value'))
    var market = d3.select('#market-order').property('checked')

    if (!(amount > 0)) return

    if (market) {
        binance.futuresMarketBuy('BTCUSDT', amount)
            .catch(error => console.error(error))
    }
    else if (price > 0) {
        binance.futuresBuy('BTCUSDT', amount, price, {'timeInForce': 'GTX'})
            .catch(error => console.error(error))
    }
}

function onSell () {
    var price = parseFloat(d3.select('#sell-price').property('value'))
    var amount = parseFloat(d3.select('#sell-amount').property('value'))
    var market = d3.select('#market-order').property('checked')

    if (!(amount > 0)) return

    if (market) {
        binance.futuresMarketSell('BTCUSDT', amount)
            .catch(error => console.error(error))
    }
    else if (price > 0) {
        binance.futuresSell('BTCUSDT', amount, price, {'timeInForce': 'GTX'})
            .catch(error => console.error(error))
    }
}

function onChangeAmount (side) {
    var amount = forceNumInput()
    var draft = chart.draftLinesData[0]

    if (draft && side == draft.side) {
        chart.draftLinesData[0].qty = Number(amount)
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
