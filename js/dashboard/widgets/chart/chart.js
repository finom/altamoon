'use strict'
const api = require('../../../apis/futures')

const Svg = require('./items/svg')
const Axes = require('./items/axes')
const ClipPath = require('./items/clip-path')
const Crosshair = require('./items/crosshair')
const GridLines = require('./items/grid-lines')
const Lines = require('./items/lines')
const LineLabels = require('./items/line-labels')
const MeasureTool = require('./items/measure-tool')
const Plot = require('./plot/plot')

const Listeners = require('./events/listeners')


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
            orderLines: [],
            draftLines: [],
        }

        this._getDimensions()
        this._createItems()
        this._appendContainers()
        this._addEventListeners()
        this._loadData()
        this._initDraw()
        this.draw()
    }

    _getDimensions () {
        let container = this.container.node()
        let header = d3.select(this.containerId + ' > header').node()
        let width = container.offsetWidth
        let height = container.offsetHeight - header.offsetHeight

        this.margin = { top: 0, right: 55, bottom: 30, left: 55 }
        this.width = width - this.margin.left - this.margin.right
        this.height = height - this.margin.top - this.margin.bottom
    }

    _createItems () {
        this.scales = {
            x: d3.scaleTime().range([0, this.width]),
            y: d3.scaleSymlog().range([this.height, 0])
        }

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

        this.positionLabel = new LineLabels(this)
        this.orderLabels = new LineLabels(this)
        this.draftLabels = new LineLabels(this)

        this.plot = new Plot(this.scales)

        this.measureTool = new MeasureTool(this)

        this.crosshair = new Crosshair(this)

        this.zoom = d3.zoom()
    }

    _appendContainers () {
        /* Order of appending = visual z-order (last is top) */
        this.svg.appendTo(this.containerId)

        this.clipPath.appendTo(this.svg, 'clipChart')

        this.gridLines.appendTo(this.svg)

        this.axes.appendTo(this.svg)

        this.positionLine.appendTo(this.svg, 'position-line')
        this.liquidationLine.appendTo(this.svg, 'liquidation-line')
        this.bidAskLines.appendTo(this.svg, 'bid-ask-lines')
        this.priceLine.appendTo(this.svg, 'price-line')

        this.plot.appendTo(this.svg)

        this.measureTool.appendTo(this.svg, 'measurer')

        this.crosshair.appendTo(this.svg)

        this.orderLines.appendTo(this.svg, 'order-lines')
        this.draftLines.appendTo(this.svg, 'draft-lines')

        this.positionLabel.appendTo(this.svg, 'position-label')
        this.orderLabels.appendTo(this.svg, 'order-labels')
        this.draftLabels.appendTo(this.svg, 'draft-labels')
    }

    _addEventListeners () {
        this.listeners = new Listeners(this)
    }

    _loadData () {
        events.on('api.candlesUpdate', d => {
            this.data.candles.push(...d)
            this._calcXDomain()
            this.svg.call(this.zoom.translateBy, 0)
        })
        api.getCandles({interval: '1m'})
    }

    _initDraw () {
        this.listeners.setEventListeners()
        api.getPosition()
        api.getOpenOrders()

        this.svg.call(this.zoom.translateBy, -100) // Right padding
    }

    draw () {
        this._calcXDomain()
        this._calcYDomain()

        this.axes.draw()

        this.gridLines.draw(this.scales.y)

        this.priceLine.draw(this.data.priceLine)
        this.positionLine.draw(this.data.positionLine)
        this.bidAskLines.draw(this.data.bidAskLines)
        this.liquidationLine.draw(this.data.liquidationLine)
        this.orderLines.draw(this.data.orderLines).draggable()
        this.draftLines.draw(this.data.draftLines).draggable()

        this.positionLabel.draw(this.data.positionLine)
        this.orderLabels.draw(this.data.orderLines)
        this.draftLabels.draw(this.data.draftLines)

        this.crosshair.draw()

        this.plot.draw(this.data.candles)

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
        this.positionLine.resize()
        this.liquidationLine.resize()
        this.measureTool.resize()
        this.crosshair.resize()

        if (this.data.candles.length) {
            this.draw()
            // Pan chart
            this.svg.call(this.zoom.translateBy, 0)
        }
    }

    _calcXDomain() {
        let candles = this.data.candles.slice(-Math.round(this.width / 3), this.data.candles.length)
        let xDomain = (candles.length)
                ? [candles[0].date, candles.last.date]
                : [new Date(0), new Date()]
        this.scales.x.domain(xDomain)
    }

    _calcYDomain() {
        let xDomain = this.plot.xScale.domain()
        let candles = this.data.candles.filter(x =>
            x.timestamp >= xDomain[0].getTime()
            && x.timestamp <= xDomain[1].getTime()
        )
        let yDomain = (candles.length)
                ? [d3.min(candles, d => d.low), d3.max(candles, d => d.high)]
                : [0,1]

        this.scales.y.domain(yDomain)

        // Padding
        let yPadding = this.scales.y.invert(0) - this.scales.y.invert(200)
        yPadding = Math.round(yPadding)
        yDomain[0] -= yPadding
        yDomain[1] += yPadding

        this.scales.y.domain(yDomain)
    }
}
