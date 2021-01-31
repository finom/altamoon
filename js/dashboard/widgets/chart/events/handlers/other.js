/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

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
        this.measurer = this.chart.measurer
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

        order(d.symbol, d.qty, d.value.toFixed(this.chart.yPrecision), {
                'reduceOnly': d.reduceOnly,
                'timeInForce': d.timeInForce
            })
            .catch(error => console.error(error))
    }

    onZoomOrDrag () {
        let transform = d3.event.transform
        let scaledX = transform.rescaleX(this.scales.x)

        this.scales.scaledX = scaledX
        this.axes.x.scale(scaledX)
        this.gridLines.x.scale(scaledX)
        this.plot.xScale = scaledX

        // let scaledY = transform.rescaleY(scales.y)
        // plot.yScale = scaledY
        this.chart.draw()
    }

    measurerOnClick () {
        if (event.shiftKey) {
            if (this.measurer.drawing)
                this.measurer.drawing = false
            else {
                this.measurer.drawing = true
                this.measurer.start = null
                this.drawMeasurer()
            }
        }
        else if (this.measurer.drawing) {
            this.measurer.drawing = false
        }
        else if (!this.measurer.hidden)
            this.measurer.hide()
    }

    drawMeasurer () {
        if (!this.measurer.drawing)
            return

        let coords = d3.mouse(this.chart.svg.graph.node())
        coords = { x: coords[0], y: coords[1] }

        this.measurer.draw(coords)
    }
}
