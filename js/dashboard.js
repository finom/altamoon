const chart = require('./js/dashboard/chart.js')
const trading = require('./js/dashboard/trading.js')
const myOrders = require('./js/dashboard/my-orders.js')

//// CHART
chart.drawChart('#chart')

//// TRADING
d3.selectAll('.num-input')
	.on('keyup', () => { trading.forceNumInput() })
d3.select('#market-order')
	.on('click', () => { trading.onMarketOrderToggled() })
d3.select('#buy')
	.on('click', () => { trading.onBuy() })
d3.select('#sell')
	.on('click', () => { trading.onSell() })

//// MY ORDERS
