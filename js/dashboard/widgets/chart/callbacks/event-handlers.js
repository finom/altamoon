'use strict'
const api = require('../../../../apis/futures')
const trading = require('../../trading')

module.exports = class EventHandlers {

    constructor (
        xAxis,
        xGridlines,
        candles,
        datasets,
        draw,
        draftLabels,
        orderLabels,
    ) {
        this.xAxis = xAxis
        this.xGridlines = xGridlines
        this.candles = candles
        this.datasets = datasets
        this.draw = draw
        this.draftLabels = draftLabels
        this.orderLabels = orderLabels

        this.draftLinesData = this.datasets.draftLinesData
    }

    placeOrderDraft (price) {
        price = +(price.toFixed(2))
        let lastPrice = (api.lastPrice)
                ? api.lastPrice
                : this.candles.last.close
        let side = (price <= lastPrice) ? 'buy' : 'sell'
        let qty = d3.select('#' + side + '-qty').property('value')

        let data = { value: price, qty: Number(qty), side: side }

        this.draftLinesData.length = 0
        this.draftLinesData.push(data)

        this.onDragDraft(data) // Wobbly coding <(°v°)<
        this.draw()
    }

    onDragDraft (d) {
        let price = +(d.value.toFixed(2))
        let qty = d3.select('#' + d.side + '-qty').property('value')

        this.draftLinesData[0].value = price
        this.draftLinesData[0].qty = Number(qty)

        events.emit('chart.draftOrderMoved', d.side, price, qty)

        // Redraw
        this.draftLabels.draw(this.draftLinesData)
    }

    draftToOrder (d, i) {
        this.draftLinesData.splice(i, 1)

        events.emit('chart.draftOrderMoved', d.side, null, null)

        this.draw()

        let order = (d.side === 'buy')
            ? trading.onBuy
            : trading.onSell

        order('limit')
    }

    onDragOrder (d) {
        let orderLinesData = this.datasets.orderLinesData
        let currentOrder = orderLinesData.filter(x => x.id === d.id)[0]
        if (!currentOrder || currentOrder.price === d.value)
            return
        this.orderLabels.draw(orderLinesData)
    }

    onDragOrderEnd (d) {
        /* Delete order, recreate at new price */
        let orderLinesData = this.datasets.orderLinesData
        let currentOrder = orderLinesData.filter(x => x.id === d.id)[0]
        if (!currentOrder || currentOrder.price === d.value)
            return

        api.cancelOrder(d.id)

        let order = (d.side === 'buy')
            ? api.lib.futuresBuy
            : api.lib.futuresSell

        order(d.symbol, d.qty, d.value.toFixed(2), {
                'reduceOnly': d.reduceOnly,
                'timeInForce': d.timeInForce
            })
            .catch(error => console.error(error))
    }

    onZoom() {
        let transform = d3.event.transform
        let scaledX = transform.rescaleX(xScale)

        this.xAxis.scale(scaledX)
        this.xGridlines.scale(scaledX)
        this.plot.xScale = scaledX

        // let scaledY = transform.rescaleY(yScale)
        // plot.yScale = scaledY
        this.draw()
    }

}
