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

        events.on('api.candlesUpdate', this.updateCandles)
        events.on('api.lastCandleUpdate', this.updateLastCandle)
        events.on('api.priceUpdate', this.updatePrice)
        events.on('api.bidAskUpdate', this.updateBidAsk)
        events.on('trading.qtyUpdate', this.updateDraft)
        events.on('api.orderUpdate', this.updateOpenOrders)
        events.on('api.positionUpdate', this.updatePosition)
        events.on('api.positionUpdate', this.updateBreakEven)
        events.on('liquidation.update', this.updateLiquidation)

        this.chart.draftLines.on('drag', this.onDragDraft)
        this.chart.orderLines.on('drag', this.onDragOrder)
                             .on('dragend', this.onDragOrderEnd)
        this.chart.draftLabels.on('click', (d, i) => this.draftToOrder(d, i))
        this.chart.orderLabels.on('click', d => api.cancelOrder(d.id))

        // Measure tool
        this.chart.svg
            .on('click.measurer', () => this.measurerOnClick())
            .on('mousemove.measurer', () => this.drawMeasurer())

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


    // Data update callbacks
    updateCandles = (...args) => this.dataUpdates.updateCandles(...args)
    updateLastCandle = (...args) => this.dataUpdates.updateLastCandle(...args)
    updatePrice = (...args) => this.dataUpdates.updatePrice(...args)
    updateBidAsk = (...args) => this.dataUpdates.updateBidAsk(...args)
    updateLastCandle = (...args) => this.dataUpdates.updateLastCandle(...args)
    updatePosition = (...args) => this.dataUpdates.updatePosition(...args)
    updateBreakEven = (...args) => this.dataUpdates.updateBreakEven(...args)
    updateDraft = (...args) => this.dataUpdates.updateDraft(...args)
    updateOpenOrders = (...args) => this.dataUpdates.updateOpenOrders(...args)
    updateLiquidation = (...args) => this.dataUpdates.updateLiquidation(...args)

    // Order draft callbacks
    placeOrderDraft = (...args) => this.draftHandlers.placeOrderDraft(...args)
    onDragDraft = (...args) => this.draftHandlers.onDragDraft(...args)
    draftToOrder = (...args) => this.draftHandlers.draftToOrder(...args)

    // Other callbacks
    onDragOrder = (...args) => this.other.onDragOrder(...args)
    onDragOrderEnd = (...args) => this.other.onDragOrderEnd(...args)
    onZoomOrDrag = (...args) => this.other.onZoomOrDrag(...args)
    measurerOnClick = (...args) => this.other.measurerOnClick(...args)
    drawMeasurer = (...args) => this.other.drawMeasurer(...args)
}
