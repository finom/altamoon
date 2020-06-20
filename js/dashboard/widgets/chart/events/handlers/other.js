'use strict'
const api = require('../../../../../apis/futures')

module.exports = class OtherHandlers {

    constructor (chart) {
        this.chart = chart
        this.scales = chart.scales
        this.axes = chart.axes
        this.plot = chart.plot
        this.gridLines = chart.gridLines
        this.orderLabels = chart.orderLabels
        this.orderLinesData = chart.data.orderLines
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

    onZoomOrDrag () {
        let transform = d3.event.transform
        let scaledX = transform.rescaleX(this.scales.x)

        this.axes.x.scale(scaledX)
        this.gridLines.x.scale(scaledX)
        this.plot.xScale = scaledX

        // let scaledY = transform.rescaleY(scales.y)
        // plot.yScale = scaledY
        this.chart.draw()
    }

    drawMeasureTool () {
        if (!event.shiftKey)
            return

        let coords = d3.mouse(this.chart.svg.graph.node())
        coords = { x: coords[0], y: coords[1] }

        this.chart.measureTool.draw(coords)
    }
}
