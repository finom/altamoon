'use strict'
/**
 * Calculate short & long liquidation previews based on position, open orders
 * and draft orders. See Binance docs for formula.
 * */
const api = require('../apis/futures')

let leverage
let maintenanceTable = [
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
let position = {}
let draft = {}
let orders = { buy: [], sell: [] }

// Event listeners
events.on('chart.draftOrderMoved', updateDraft)
events.on('api.orderUpdate', updateOrders)
events.on('api.positionUpdate', updatePosition)
events.on('trading.leverageUpdate', onLeverageUpdate)
events.on('trading.qtyUpdate', onTradingQtyUpdate)

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   MAIN
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function updateLiquidation (side) {
    if(!leverage)
        return

    if (!side) {
        updateLiquidation('buy')
        updateLiquidation('sell')
        return
    }
    if (!draft[side] && !orders[side].length) { // No draft or orders
        events.emit('liquidation.update', null, side)
        return
    }

    let direction = { buy: 1, sell: -1}[side]
    let liquidation

    // Merge draft, orders & position in a single array
    let items = [...orders[side]]
    if(draft[side]) items.push(draft[side])
    if(position[side]) items.push(position[side])

    if (!items.length) {
        events.emit('liquidation.update', null, side)
        return
    }

    items.sort((a, b) => direction * b.price - a.price * direction)

    let total = { margin: 0, averagePrice: 0, qty: 0 }

    /**
     * Add up items one by one, (re)calculate liquidation for each,
     * stop when current item is out of last liquidation price
     * */
    for (let [i, x] of items.entries()) {
        if (!x || !x.qty || !x.price)
            continue

        if (liquidation && direction * x.price <= liquidation * direction)
            break

        let weightedTotalPrice = x.price * x.qty + total.averagePrice * total.qty
        let totalQty = x.qty + total.qty

        total.averagePrice = weightedTotalPrice / totalQty
        total.margin += x.margin || x.qty * x.price / leverage
        total.qty = totalQty

        let positionValue = direction * total.qty * total.averagePrice

        let maintenance
        for (let y of maintenanceTable)
            if (total.qty * total.averagePrice < y[0] * 1000) {
                maintenance = { rate: y[1], amount: y[2] }
                break
            }

        liquidation = (total.margin + maintenance.amount - positionValue)
                      / (total.qty * (maintenance.rate - direction))
    }

    events.emit('liquidation.update', liquidation, side)
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   EVENT HANDLERS
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function updateDraft (side, price, qty) {
    if (price)
        draft[side] = {
            price: +price,
            qty: +qty
        }
    else
        draft[side] = undefined

    // Remove other side if existing
    let otherSide = side == 'buy' ? 'sell' : 'buy'
    draft[otherSide] = undefined

    updateLiquidation()
}

function onTradingQtyUpdate (qty, side) {
    // Update draft qty
    if (draft[side]) {
        draft[side].qty = +qty
        updateLiquidation(side)
    }
}

function updateOrders () {
    let buys = api.openOrders.filter(x => x.side === 'buy')
    let sells = api.openOrders.filter(x => x.side === 'sell')

    orders.buy = buys.map(x => { return {
        price: +x.price,
        qty: +x.qty
    } })
    orders.sell = sells.map(x => { return {
        price: +x.price,
        qty: +x.qty
    } })
    updateLiquidation()
}

function updatePosition () {
    let p = api.position

    let qty = Math.abs(p.qty)

    // Remove other side if existing
    let otherSide = p.side === 'buy' ? 'sell' : 'buy'
    position[otherSide] = undefined

    // Calculate margin from liquidation, qty and price, because Binance
    // peeps are unable to provide the proper margin nor leverage values.
    // -------------------------------------------------------------------------
    let direction = { buy: 1, sell: -1}[p.side]
    let positionValue = qty * p.price * direction

    let maintenance
    for (let y of maintenanceTable)
        if (qty * p.price < y[0] * 1000) {
            maintenance = { rate: y[1], amount: y[2] }
            break
        }

    let margin = p.liquidation * qty * (maintenance.rate - direction)
            - maintenance.amount + positionValue
    // -------------------------------------------------------------------------

    position[p.side] = {
        price: +p.price,
        qty: qty,
        margin: margin
    }
    updateLiquidation()
}

function onLeverageUpdate (d) {
    leverage = d
    updateLiquidation()
}
