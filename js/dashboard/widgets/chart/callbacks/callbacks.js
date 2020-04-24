'use strict'
const DataUpdates = require('./data-updates')
const EventHandlers = require('./event-handlers')

module.exports = class ChartCallbacks {

    constructor (
        candles,
        datasets,
        svg,
        draw,
        plot,
        priceLine,
        bidAskLines,
        liquidationLine,
        zoom,
    ) {
        this.dataUpdates = new DataUpdates(
            candles,
            datasets,
            svg,
            draw,
            plot,
            priceLine,
            bidAskLines,
            liquidationLine,
            zoom,
        )
        // this.eventHandlers = new EventHandlers(
        //     candles,
        //     datasets,
        //     draw,
        //     lines,
        //     draftLabels,
        //     orderLabels,
        // )
    }

    // Data update callbacks
    updatePrice = (data) =>this.dataUpdates.updatePrice(data)
    updateBidAsk = (data) => this.dataUpdates.updateBidAsk(data)
    updateLastCandle = (data) => this.dataUpdates.updateLastCandle(data)
    updatePosition = (data) => this.dataUpdates.updatePosition(data)
    updateDraft = (...args) => this.dataUpdates.updateDraft(...args)
    updateOpenOrders = (data) => this.dataUpdates.updateOpenOrders(data)
    updateLiquidation = (data, side) => this.dataUpdates.updateLiquidation(data, side)
}
