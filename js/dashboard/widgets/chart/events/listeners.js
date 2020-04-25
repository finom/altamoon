'use strict'
const DataUpdates = require('./handlers/data-updates')
const Other = require('./handlers/other')

module.exports = class Listeners {

    constructor (
        candles,
        datasets,
        svg,
        scales,
        axes,
        plot,
        gridLines,
        priceLine,
        bidAskLines,
        liquidationLine,
        draftLabels,
        orderLabels,
        draw,
        zoom,
    ) {
        this.dataUpdates = new DataUpdates(
            candles,
            datasets,
            svg,
            plot,
            priceLine,
            bidAskLines,
            liquidationLine,
            draw,
            zoom,
        )

        this.other = new Other(
            candles,
            datasets,
            scales,
            axes,
            plot,
            gridLines,
            draftLabels,
            orderLabels,
            draw,
        )
    }

    setEventListeners () {
        events.on('api.lastCandleUpdate', this.updateLastCandle)
        events.on('api.priceUpdate', this.updatePrice)
        events.on('api.bidAskUpdate', this.updateBidAsk)
        events.on('trading.qtyUpdate', this.updateDraft)
        events.on('api.orderUpdate', this.updateOpenOrders)
        events.on('api.positionUpdate', this.updatePosition)
        events.on('liquidation.update', this.updateLiquidation)
    }

    // Data update callbacks
    updateLastCandle = (...args) => this.dataUpdates.updateLastCandle(...args)
    updatePrice = (...args) =>this.dataUpdates.updatePrice(...args)
    updateBidAsk = (...args) => this.dataUpdates.updateBidAsk(...args)
    updateLastCandle = (...args) => this.dataUpdates.updateLastCandle(...args)
    updatePosition = (...args) => this.dataUpdates.updatePosition(...args)
    updateDraft = (...args) => this.dataUpdates.updateDraft(...args)
    updateOpenOrders = (...args) => this.dataUpdates.updateOpenOrders(...args)
    updateLiquidation = (...args) => this.dataUpdates.updateLiquidation(...args)

    placeOrderDraft = (...args) => this.other.placeOrderDraft(...args)
    onDragDraft = (...args) => this.other.onDragDraft(...args)
    draftToOrder = (...args) => this.other.draftToOrder(...args)
    onDragOrder = (...args) => this.other.onDragOrder(...args)
    onDragOrderEnd = (...args) => this.other.onDragOrderEnd(...args)
    onZoom = (...args) => this.other.onZoom(...args)
}
