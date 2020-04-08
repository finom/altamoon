'use strict'
const api = require('../api-futures')
const trading = require('../dashboard/trading')

events.on('chart.draftOrderMoved', onDraftOrderMoved)
events.on('api.orderUpdate', onOrderUpdate)
events.on('trading.leverageUpdate', onLeverageUpdate)

var balance         // = Margin in isolated mode
var direction       // 1 (buy) or -1 (sell)
var entryPrice      // Average entry price
var qty             // in BTC (or other coin)
var side // fixme

function updateLiquidation () {
    /* Calculate liquidation based on position and all open and draft orders.
     * See Binance docs for formula */
    var position = direction * qty * entryPrice
    var maintenance
    var maintenanceTable = [
        // Position max ($k), Maintenance rate, Maintenance amount ($)
        [50, 0.004, 0],
        [250, 0.005, 50],
        [1000, 0.01, 1300],
        [5000, 0.025, 16300],
        [10000, 0.05, 141300],
        [20000, 0.1, 641300],
        [35000, 0.125, 1141300],
        [50000, 0.15, 2016300],
        [9999999999999, 0.25, 7016300]
    ]
    for (let x of maintenanceTable)
        if (qty * entryPrice < x[0] * 1000) {
            maintenance = { rate: x[1], amount: x[2] }
            break
        }

    var liqui = (balance + maintenance.amount - position)
            / (qty * (maintenance.rate - direction))

    events.emit('liquidation.update', liqui)
}

function onOrderUpdate (d) {
}

function onDraftOrderMoved (side_, price, quantity) {
    side = side_
    balance = trading.getMarginCost(side)
    direction = (side == 'buy') ? 1 : -1
    entryPrice = price
    qty = quantity
    updateLiquidation()
}

function onLeverageUpdate (leverage) {
    balance = trading.getMarginCost(side)
    updateLiquidation()
}
