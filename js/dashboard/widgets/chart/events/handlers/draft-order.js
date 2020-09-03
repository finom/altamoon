'use strict'
const api = require('../../../../../apis/futures')
const trading = require('../../../trading')

module.exports = class DraftOrderHandlers {

    constructor (chart) {
        this.chart = chart
        this.candles = chart.data.candles
        this.draftLabels = chart.draftLabels
        this.draftLinesData = chart.data.draftLines
    }

    placeOrderDraft (node) {
        let price = this.chart.scales.y.invert( d3.mouse(node)[1] )
        price = +(price.toFixed(this.chart.yPrecision))

        let lastPrice = (api.lastPrice)
                ? api.lastPrice
                : this.candles.last.close
        let side = (price <= lastPrice) ? 'buy' : 'sell'
        let qty = d3.select('#' + side + '-qty').property('value')

        let data = { value: price, qty: Number(qty), side: side }
        this.draftLinesData[0] = data

        this.onDragDraft(data) // Wobbly coding <(°v°)<
        this.chart.draw()
    }

    onDragDraft (d) {
        let price = +(d.value.toFixed(this.chart.yPrecision))
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

        this.chart.draw()

        trading.onBuySell(d.side, 'limit')
    }
}
