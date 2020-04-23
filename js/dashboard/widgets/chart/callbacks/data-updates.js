'use strict'

module.exports = class DataUpdateCallbacks {

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
        this.candles = candles
        this.datasets = datasets
        this.svg = svg
        this.draw = draw
        this.plot = plot
        this.priceLine = priceLine
        this.liquidationLine = liquidationLine
        this.bidAskLines = bidAskLines
        this.zoom = zoom
    }

    updatePrice (price) {
        let priceLineData = this.datasets.priceLineData

        priceLineData[0] = {value: price}
        this.priceLine.draw(priceLineData)
    }

    updateBidAsk (data) {
        let baLinesData = this.datasets.bidAskLinesData

        if (baLinesData[0]) {
            if (baLinesData[0].value === data.a
                && baLinesData[1].value === data.b)
                return
        }
        baLinesData.length = 0
        baLinesData.push({value: data.a}, {value: data.b})

        this.bidAskLines.draw(baLinesData)
    }

    updateLastCandle (candle) {
        let isSameCandle = candle.timestamp === this.candles.last.timestamp

        if (isSameCandle) {
            this.candles.last = candle
            this.plot.updateLast(candle)
        } else {
            this.candles.push(candle)
            this.draw()
            // Pan chart
            this.svg.call(this.zoom.translateBy, 0) // Ehh... ¯\_(°~°)_/¯
        }
    }

    updatePosition (positions) {
        let liquidationLineData = this.datasets.liquidationLineData
        let positionLineData = this.datasets.positionLineData

        let position = positions.filter(x => x.symbol === SYMBOL)[0]
        let i = liquidationLineData.findIndex(x => x.type === 'real')

        if (position.qty && position.liquidation) {
            // Add new
            if (i >= 0)
                liquidationLineData[i].value = position.liquidation
            else
                liquidationLineData.push({ value: position.liquidation, type: 'real' })
        }
        else // Remove
            if (i >= 0) liquidationLineData.splice(i, 1)

        positionLineData.length = 0
        if (position.qty) positionLineData.push(position)
        this.draw()
    }

    updateDraft (qty, side) {
        let draft = this.datasets.draftLinesData[0]
        if (draft && side === draft.side) {
            draft.qty = +qty
            this.draw()
        }
    }

    updateOpenOrders (orders) {
        let dataset = this.datasets.orderLinesData
        dataset.length = 0
        dataset.push(...orders)
        this.draw()
    }

    updateLiquidation (price, side) {
        let liquidationLineData = this.datasets.liquidationLineData

        let index = liquidationLineData.findIndex(x => x.side === side)

        if (!price && index >= 0)
            // Remove
            liquidationLineData.splice(index, 1)
        else if (price && index >= 0)
            // Update
            liquidationLineData[index].value = price
        else if (price)
            // Add
            liquidationLineData.push({ value: price, type: 'draft', side: side })

        //Redraw
        this.liquidationLine.draw(liquidationLineData)
        // Set style on liquidation lines
        this.liquidationLine.wrapper.selectAll('.liquidation-line > g')
            .attr('data-type', d => d.type)
    }
}
