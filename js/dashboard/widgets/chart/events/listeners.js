'use strict'
const api = require('../../../../apis/futures')
const DataUpdateHandlers = require('./handlers/data-updates')
const DrafOrderHandlers = require('./handlers/draft-order')
const OtherHandlers = require('./handlers/other')

module.exports = class Listeners {

    constructor (chart) {
        this.chart = chart
        this.dataUpdates = new DataUpdateHandlers(chart)
        this.draftHandlers = new DrafOrderHandlers(chart)
        this.other = new OtherHandlers(chart)
    }

    setEventListeners () {
        events.on('api.lastCandleUpdate', this.updateLastCandle)
        events.on('api.priceUpdate', this.updatePrice)
        events.on('api.bidAskUpdate', this.updateBidAsk)
        events.on('trading.qtyUpdate', this.updateDraft)
        events.on('api.orderUpdate', this.updateOpenOrders)
        events.on('api.positionUpdate', this.updatePosition)
        events.on('liquidation.update', this.updateLiquidation)

        this.chart.draftLines.on('drag', this.onDragDraft)
        this.chart.orderLines.on('drag', this.onDragOrder)
                             .on('dragend', this.onDragOrderEnd)
        this.chart.draftLabels.on('click', (d, i) => this.draftToOrder(d, i))
        this.chart.orderLabels.on('click', d => api.cancelOrder(d.id))

        // Measure tool
        this.chart.svg
            .on('mousedown', () => this.removeZoom())
            .on('click.measurer', () => this.chart.measureTool.hide())
        this.chart.svg.svg
            .call(d3.drag()
                .on('start', () => this.chart.measureTool.start = null)
                .on('drag', () => this.drawMeasureTool())
                .on('end', () => this.addZoom())
            )

        // Zoom
        this.addZoom()

        // Place order on double click
        this.chart.svg
            .on('dblclick', (d, i, nodes) => {
                this.placeOrderDraft(nodes[i])
        })

        // Chart resize
        new ResizeObserver(() => this.chart.resize())
            .observe(this.chart.container.node())
    }

    addZoom () {
        this.chart.svg.call(
            this.chart.zoom.on('zoom', () => this.onZoomOrDrag())
        )
        // Disable double-click zoom
        this.chart.svg
            .on('dblclick.zoom', null)
    }

    removeZoom () {
        if (event.shiftKey)
            this.chart.svg.call(
                this.chart.zoom.on('zoom', null)
            )
    }


    // Data update callbacks
    updateLastCandle = (...args) => this.dataUpdates.updateLastCandle(...args)
    updatePrice = (...args) => this.dataUpdates.updatePrice(...args)
    updateBidAsk = (...args) => this.dataUpdates.updateBidAsk(...args)
    updateLastCandle = (...args) => this.dataUpdates.updateLastCandle(...args)
    updatePosition = (...args) => this.dataUpdates.updatePosition(...args)
    updateDraft = (...args) => this.dataUpdates.updateDraft(...args)
    updateOpenOrders = (...args) => this.dataUpdates.updateOpenOrders(...args)
    updateLiquidation = (...args) => this.dataUpdates.updateLiquidation(...args)

    placeOrderDraft = (...args) => this.draftHandlers.placeOrderDraft(...args)
    onDragDraft = (...args) => this.draftHandlers.onDragDraft(...args)
    draftToOrder = (...args) => this.draftHandlers.draftToOrder(...args)

    onDragOrder = (...args) => this.other.onDragOrder(...args)
    onDragOrderEnd = (...args) => this.other.onDragOrderEnd(...args)
    onZoomOrDrag = (...args) => this.other.onZoomOrDrag(...args)
    drawMeasureTool = (...args) => this.other.drawMeasureTool(...args)
}
