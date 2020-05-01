'use strict'
const api = require('../../apis/futures')
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

events.on('api.positionUpdate', updateLeverage)
events.on('chart.draftOrderMoved', updatePrice)
events.on('api.priceUpdate', updateMarketMarginCost)
events.on('api.priceUpdate', updateMarketDollarValue)

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
        updateMarginCost('buy')
        updateMarginCost('sell')
        updateDollarValue('buy')
        updateDollarValue('sell')
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
    updateDollarValue(side, price)
    updateMarginCost(side, price)
    updateFee(side, price)
}

function updatePrice (side, price) {
    if (price === null)
        return
    let input = eval(side + 'Price')
    input.property('value', price)
    updateDollarValue(side, price)
    updateMarginCost(side, price)
    updateFee(side, price)
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   QUANTITY
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function onInputQty (side) {
    qty[side] = parseNumber()

    events.emit('trading.qtyUpdate', qty[side], side)

    updateDollarValue(side)
    updateMarginCost(side)
    updateFee(side)
}

function updateDollarValue (side, price){
    if (!price)
        price = eval(side + 'Price').property('value')
    if (!qty[side])
        qty[side] = eval(side + 'Qty').property('value')

    let dollarValue = qty[side] * price
    dollarValue = d3.format(',d')(dollarValue)

    eval(side + 'DollarValue')
        .text('± ' + dollarValue + ' ₮')
}

function updateMarketDollarValue (price) {
    if (orderType().property('value') != 'market')
        return

    updateDollarValue('buy', price)
    updateDollarValue('sell', price)
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
    if (!price)
        price = eval(side + 'Price').property('value')

    let margin = getMarginCost(side, price)
    let percentage = margin / api.account.totalWalletBalance
    margin = d3.format(',.2f')(margin)
    percentage = d3.format(',.1%')(percentage || 0)


    d3.select('#trading .' + side +  ' .margin .val')
        .text(margin + ' ₮ (' + percentage + ')')
}

function updateMarketMarginCost (price) {
    if (orderType().property('value') != 'market')
        return

    updateMarginCost('buy', price)
    updateMarginCost('sell', price)
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   Fee
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function getFee (side, price) {
    if (!price)
        price = eval(side + 'Price').property('value')
    if (!qty[side])
        qty[side] = eval(side + 'Qty').property('value')

    return qty[side] * price * 0.02 / 100
}

function updateFee (side, price) {
    if (!price)
        price = eval(side + 'Price').property('value')
    let fee = getFee(side, price)
    fee = d3.format(',.2f')(fee)

    d3.select('#trading .' + side +  ' .fee .val')
        .text(fee + ' ₮')
}

function updateMarketFee (price) {
    if (orderType().property('value') != 'market')
        return

    updateFee('buy', price)
    updateFee('sell', price)
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
