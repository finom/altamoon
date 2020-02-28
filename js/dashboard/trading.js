const { binance } = require('../fapi.js')

module.exports = { onMarketOrderToggled, onBuy, onSell, forceNumInput }

function onMarketOrderToggled () {
    var tradingDiv = document.getElementById('trading')
    var buyBtn = document.getElementById('buy')
    var sellBtn = document.getElementById('sell')

    if (event.target.checked) {
        tradingDiv.className = 'market'
        buyBtn.innerHTML = 'PUMP'
        sellBtn.innerHTML = 'DUMP'
    } else {
        tradingDiv.className = ''
        buyBtn.innerHTML = 'BUY'
        sellBtn.innerHTML = 'SELL'
    }
}

function onBuy () {
    var price = Number(document.getElementById('buy-price').value)
    var amount = Number(document.getElementById('buy-amount').value)
    var market = document.getElementById('market-order').checked

    if (!(amount > 0)) return

    if (market) {
        const classicPromise = binance.futuresMarketBuy('BTCUSDT', amount)
                .catch(error => console.error(error))
    }
    else if (price > 0) {
        const classicPromise = binance.futuresBuy('BTCUSDT', amount, price, {'timeInForce': 'GTX'})
                .catch(error => console.error(error))
    }
}

function onSell () {
    var price = Number(document.getElementById('sell-price').value)
    var amount = Number(document.getElementById('sell-amount').value)
    var market = document.getElementById('market-order').checked

    if (!(amount > 0)) return

    if (market) {
        const classicPromise = binance.futuresMarketSell('BTCUSDT', amount)
                .catch(error => console.error(error))
    }
    else if (price > 0) {
        const classicPromise = binance.futuresSell('BTCUSDT', amount, price, {'timeInForce': 'GTX'})
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
