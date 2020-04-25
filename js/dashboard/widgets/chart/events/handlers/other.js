'use strict'
const api = require('../../../../../apis/futures')
const trading = require('../../../trading')

module.exports = class EventHandlers {

    constructor (
        candles,
        datasets,
        scales,
        axes,
        plot,
        gridLines,
        draftLabels,
        orderLabels,
        draw,
    ) {
        this.candles = candles
        this.scales = scales
        this.axes = axes
        this.plot = plot
        this.gridLines = gridLines
        this.draftLabels = draftLabels
        this.orderLabels = orderLabels
        this.draw = draw

        this.draftLinesData = datasets.draftLinesData
        this.orderLinesData = datasets.orderLinesData
    }

    placeOrderDraft (price) {
        price = +(price.toFixed(2))
        let lastPrice = (api.lastPrice)
                ? api.lastPrice
                : this.candles.last.close
        let side = (price <= lastPrice) ? 'buy' : 'sell'
        let qty = d3.select('#' + side + '-qty').property('value')

        let data = { value: price, qty: Number(qty), side: side }
        this.draftLinesData[0] = data

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
        let currentOrder = this.orderLinesData.filter(x => x.id === d.id)[0]
        if (!currentOrder || currentOrder.price === d.value)
            return
            this.orderLabels.draw(this.orderLinesData)
    }
    onDragOrderEnd (d) {
        /* Delete order, recreate at new price */
        let currentOrder = this.orderLinesData.filter(x => x.id === d.id)[0]
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

    onZoom () {
        let transform = d3.event.transform
        let scaledX = transform.rescaleX(this.scales.x)

        this.axes.x.scale(scaledX)
        this.gridLines.x.scale(scaledX)
        this.plot.xScale = scaledX

        // let scaledY = transform.rescaleY(scales.y)
        // plot.yScale = scaledY
        this.draw()
    }

}
