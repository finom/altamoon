'use strict'
const stats = require('../../../../../data/stats')

module.exports = class DataUpdateHandlers {

    constructor (chart) {
        this.chart = chart
        this.data = chart.data
        this.svg = chart.svg
        this.plot = chart.plot
        this.priceLine = chart.priceLine
        this.bidAskLines = chart.bidAskLines
        this.liquidationLine = chart.liquidationLine
        this.draw = chart.draw
        this.zoom = chart.zoom
    }

    updatePrice (price) {
        let priceLineData = this.data.priceLine

        priceLineData[0] = {value: price}
        this.priceLine.draw(priceLineData)
    }

    updateBidAsk (data) {
        let baLinesData = this.data.bidAskLines

        if (baLinesData[0]) {
            if (baLinesData[0].value === data.bestAsk
                && baLinesData[1].value === data.bestBid)
                return
        }
        baLinesData.length = 0
        baLinesData.push({value: data.bestAsk}, {value: data.bestBid})

        this.bidAskLines.draw(baLinesData)
    }

    updateCandles (candles) {
        this.data.candles = candles
        this.chart._calcXDomain()
        this.svg.call(this.zoom.translateBy, 0)
    }

    updateLastCandle (candle) {
        let lastCandle = this.data.candles.last
        let isSameCandle = candle.timestamp === lastCandle.timestamp
        let newLow = candle.low < lastCandle.low
        let newHigh = candle.high > lastCandle.high

        if (isSameCandle) {
            this.data.candles.last = candle
            if (newHigh || newLow)
                this.chart.draw() // y domain likely changes, redraw everything
            else
                this.plot.updateLast(candle) // Redraw just the candle
        } else {
            this.data.candles.push(candle)
            this.chart.draw()
            // Pan chart
            this.svg.call(this.zoom.translateBy, 0)
        }
    }

    updatePosition (positions) {
        let liquidationLineData = this.data.liquidationLine
        let positionLineData = this.data.positionLine

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
        this.chart.draw()
    }

    async updateBreakEven (positions) {
        let breakEven = await stats.getBreakEven(SYMBOL)
        let lineData = this.data.breakEvenLine
        lineData.length = 0
        if (breakEven) lineData.push({ value: breakEven })
    }

    updateDraft (qty, side) {
        let draft = this.data.draftLines[0]
        if (draft && side === draft.side) {
            draft.qty = +qty
            this.chart.draw()
        }
    }

    updateOpenOrders (orders) {
        let dataset = this.data.orderLines
        dataset.length = 0
        dataset.push(...orders)
        this.chart.draw()
    }

    updateLiquidation (price, side) {
        let liquidationLineData = this.data.liquidationLine

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
