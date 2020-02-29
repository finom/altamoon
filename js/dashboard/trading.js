const { binance } = require('../fapi.js')

module.exports = { onMarketOrderToggled, onBuy, onSell, forceNumInput }

function onMarketOrderToggled () {
    var tradingDiv = d3.select('#trading')
    var buyBtn = d3.select('#buy')
    var sellBtn = d3.select('#sell')

    if (event.target.checked) {
        tradingDiv.classed('market', true)
        buyBtn.html('PUMP')
        sellBtn.html('DUMP')
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

function forceNumInput () {
    var text = event.target.value
    var regex = /[0-9]|\./

    for (let i = 0; i < text.length; i++) {
        if (!regex.test(text[i])) {
            text = text.replace(text[i], '')
            i--
        }
    }
    event.target.value = text
}
