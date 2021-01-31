/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'
const api = require('../../apis/futures')
const { config } = require('../../config')

const Toolbar = require('./chart/items/toolbar')
const Svg = require('./chart/items/svg')
const Axes = require('./chart/items/axes')
const ClipPath = require('./chart/items/clip-path')
const Crosshair = require('./chart/items/crosshair')
const GridLines = require('./chart/items/grid-lines')
const Lines = require('./chart/items/lines')
const LineLabels = require('./chart/items/line-labels')
const Measurer = require('./chart/items/measurer')
const Plot = require('./chart/plot/plot')

const Listeners = require('./chart/events/listeners')


module.exports = class Chart {

    constructor (containerId = '#chart') {
        this.containerId = containerId
        this.container = d3.select(containerId)

        this.data = {
            candles: [],
            priceLine: [],
            positionLine: [],
            bidAskLines: [],
            liquidationLine: [],
            breakEvenLine: [],
            orderLines: [],
            draftLines: [],
        }

        this._load()
    }

    _load () {
        // Wait for symbol info from the API then proceed with loading.
        events.once('api.exchangeInfoUpdate', d => {
            this.symbolInfo = d.symbols.filter(x => x.symbol === SYMBOL)[0]
            this.yPrecision = this.symbolInfo.pricePrecision
            this._proceedLoading()
        })
        api.getExchangeInfo()
    }

    _proceedLoading () {
        this._getDimensions()
        this._createItems()
        this._appendContainers()
        this._addEventListeners()
        this._fetchData()
        this._initDraw()
        this.draw()
    }

    _getDimensions () {
        let container = this.container.node()
        let header = d3.select(this.containerId + ' > header').node()
        let toolbarHeight = 40 // Like in the css
        let width = container.offsetWidth
        let height = container.offsetHeight - header.offsetHeight - toolbarHeight

        this.margin = { top: 0, right: 55, bottom: 30, left: 55 }
        this.width = width - this.margin.left - this.margin.right
        this.height = height - this.margin.top - this.margin.bottom
    }

    _createItems () {
        this.scales = {
            x: d3.scaleTime().range([0, this.width]),
            y: d3.scaleSymlog().range([this.height, 0])
        }

        this.toolbar = new Toolbar(this)

        this.svg = new Svg(this)

        this.axes = new Axes(this)

        this.gridLines = new GridLines(this)

        this.clipPath = new ClipPath(this)

        this.priceLine = new Lines(this)
        this.bidAskLines = new Lines(this)
        this.draftLines = new Lines(this)
        this.orderLines = new Lines(this)
        this.positionLine = new Lines(this)
        this.liquidationLine = new Lines(this)
        this.breakEvenLine = new Lines(this)

        this.positionLabel = new LineLabels(this)
        this.orderLabels = new LineLabels(this)
        this.draftLabels = new LineLabels(this)

        this.plot = new Plot(this.scales)

        this.measurer = new Measurer(this)

        this.crosshair = new Crosshair(this)

        this.zoom = d3.zoom()
    }

    _appendContainers () {
        /* Order of appending = visual z-order (last is top) */
        this.svg.appendTo(this.containerId)

        this.clipPath.appendTo(this.svg, 'clipChart')

        this.gridLines.appendTo(this.svg)

        this.axes.appendTo(this.svg)

        this.breakEvenLine.appendTo(this.svg, 'break-even-line')
        this.positionLine.appendTo(this.svg, 'position-line')
        this.liquidationLine.appendTo(this.svg, 'liquidation-line')
        this.bidAskLines.appendTo(this.svg, 'bid-ask-lines')
        this.priceLine.appendTo(this.svg, 'price-line')

        this.plot.appendTo(this.svg)

        this.measurer.appendTo(this.svg, 'measurer')

        this.crosshair.appendTo(this.svg)

        this.orderLines.appendTo(this.svg, 'order-lines')
        this.draftLines.appendTo(this.svg, 'draft-lines')

        this.positionLabel.appendTo(this.svg, 'position-label')
        this.orderLabels.appendTo(this.svg, 'order-labels')
        this.draftLabels.appendTo(this.svg, 'draft-labels')
    }

    _addEventListeners () {
        this.listeners = new Listeners(this)
        this.listeners.setEventListeners()
    }

    _fetchData () {
        api.getCandles({interval: config.get('chart.interval')})
        api.getPosition()
        api.getOpenOrders()
    }

    _initDraw () {
        this.svg.call(this.zoom.translateBy, -100) // Right padding
    }

    draw () {
        this._calcXDomain()
        this._calcYDomain()

        this.axes.draw()

        this.gridLines.draw(this.scales.y)

        this.priceLine.draw(this.data.priceLine)
        this.breakEvenLine.draw(this.data.breakEvenLine)
        this.positionLine.draw(this.data.positionLine)
        this.bidAskLines.draw(this.data.bidAskLines)
        this.liquidationLine.draw(this.data.liquidationLine)
        this.orderLines.draw(this.data.orderLines).draggable()
        this.draftLines.draw(this.data.draftLines).draggable()

        this.positionLabel.draw(this.data.positionLine)
        this.orderLabels.draw(this.data.orderLines)
        this.draftLabels.draw(this.data.draftLines)

        this.plot.draw(this.data.candles)

        this.measurer.resize()

        this.crosshair.draw()

        // Color lines based on market side
        this.positionLine.wrapper.selectAll('.position-line > g')
            .attr('data-side', d => d.side)
        this.orderLines.wrapper.selectAll('.order-lines > g')
            .attr('data-side', d => d.side)
        this.draftLines.wrapper.selectAll('.draft-lines > g')
            .attr('data-side', d => d.side)
    }

    resize () {
        this._getDimensions()
        this.svg.resize()
        this.scales.x.range([0, this.width])
        this.scales.y.range([this.height, 0])
        this.axes.resize()
        this.gridLines.resize()
        this.clipPath.resize()
        this.priceLine.resize()
        this.bidAskLines.resize()
        this.draftLines.resize()
        this.orderLines.resize()
        this.breakEvenLine.resize()
        this.positionLine.resize()
        this.liquidationLine.resize()
        this.measurer.resize()
        this.crosshair.resize()

        if (this.data.candles.length) {
            this.draw()
            this.svg.call(this.zoom.translateBy, 0) // Pan chart
        }
    }

    changeInterval (interval) {
        config.set('chart.interval', interval)

        api.terminateStream('kline')
        api.streamLastCandle(interval)
        api.getCandles({interval: interval})

        events.once('api.candlesUpdate', () => {
            this.draw()
            this.plot.draw(this.data.candles, true)
            this.svg.call(this.zoom.translateBy, 0)
        })
    }

    _calcXDomain() {
        let candles = this.data.candles.slice(-Math.round(this.width / 3), this.data.candles.length)
        let xDomain = (candles.length)
                ? [candles[0].date, candles.last.date]
                : [new Date(0), new Date()]
        this.scales.x.domain(xDomain)
    }

    _calcYDomain() {
        let y = this.scales.y
        let xDomain = this.plot.xScale.domain()
        let candles = this.data.candles.filter(x =>
            x.timestamp >= xDomain[0].getTime()
            && x.timestamp <= xDomain[1].getTime()
        )
        let yDomain = (candles.length)
                ? [d3.min(candles, d => d.low), d3.max(candles, d => d.high)]
                : [0,1]

        y.domain(yDomain)

        // Padding
        let yPaddingTop = y.invert(-200) - y.invert(0)
        let yPaddingBot = y.invert(this.height)
                          - y.invert(this.height +200)

        yDomain[1] += +yPaddingTop.toFixed(this.yPrecision)
        yDomain[0] -= +yPaddingBot.toFixed(this.yPrecision)

        y.domain(yDomain)
    }
}
