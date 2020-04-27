'use strict'
const api = require('../../../apis/futures')

const Svg = require('./items/svg')
const Axes = require('./items/axes')
const GridLines = require('./items/grid-lines')
const ClipPath = require('./items/clip-path')
const Crosshair = require('./items/crosshair')
const Plot = require('./plot/plot')
const Lines = require('./items/lines')
const LineLabels = require('./items/line-labels')

const Listeners = require('./events/listeners')


module.exports = class Chart {

    constructor (container) {
        this.container = container

        this._getDimensions()
        this._createItems()
        this._appendContainers()
        this._loadData()
        this._addEventListeners()
    }

    _getDimensions() {
        this.margin = { top: 0, right: 55, bottom: 30, left: 55 }
        this.width = 960 - this.margin.left - this.margin.right
        this.height = 700 - this.margin.top - this.margin.bottom
    }

    _createItems () {
        this.scales = {
            x: d3.scaleTime().range([0, this.width]),
            y: d3.scaleSymlog().range([this.height, 0])
        }

        this.svg = new Svg(this.width, this.height, this.margin)

        this.axes = new Axes(this.scales, this.width, this.height)

        this.gridLines = new GridLines(this.scales, this.width, this.height)

        this.clipPath = new ClipPath(this.width, this.height)

        let linesArgs = [this.scales, this.axes, this.width, this.height, this.margin]
        this.priceLine = new Lines(...linesArgs)
        this.bidAskLines = new Lines(...linesArgs)
        this.draftLines = new Lines(...linesArgs)
        this.orderLines = new Lines(...linesArgs)
        this.positionLine = new Lines(...linesArgs)
        this.liquidationLine = new Lines(...linesArgs)

        this.positionLabel = new LineLabels(this.width, this.scales.y)
        this.orderLabels = new LineLabels(this.width, this.scales.y)
        this.draftLabels = new LineLabels(this.width, this.scales.y)

        this.plot = new Plot(this.scales)

        this.crosshair = new Crosshair(this.scales, this.axes, this.width, this.height)

        this.zoom = d3.zoom()
    }

    _appendContainers () {
        /* Order of appending = visual z-order (last is top) */
        this.svg.appendTo(this.container)

        this.clipPath.appendTo(this.svg, 'clipChart')

        this.gridLines.appendTo(this.svg)

        this.axes.appendTo(this.svg)

        this.positionLine.appendTo(this.svg, 'position-line')
        this.liquidationLine.appendTo(this.svg, 'liquidation-line')
        this.bidAskLines.appendTo(this.svg, 'bid-ask-lines')
        this.priceLine.appendTo(this.svg, 'price-line')

        this.plot.appendTo(this.svg)

        this.crosshair.appendTo(this.svg)

        this.orderLines.appendTo(this.svg, 'order-lines')
        this.draftLines.appendTo(this.svg, 'draft-lines')

        this.positionLabel.appendTo(this.svg, 'position-label')
        this.orderLabels.appendTo(this.svg, 'order-labels')
        this.draftLabels.appendTo(this.svg, 'draft-labels')
    }

    _loadData () {
        this.data = {}
        this.data.candles = []
        this.data.priceLine = []
        this.data.positionLine = []
        this.data.bidAskLines = []
        this.data.liquidationLine = []
        this.data.orderLines = []
        this.data.draftLines = []

        api.getCandles()
        events.on('api.candlesUpdate', d => this._initDraw(d))
    }

    _addEventListeners () {
        this.listeners = new Listeners(this)
    }

    _initDraw(candles) {
        this.data.candles.push(...candles)

        api.getPosition()
        api.getOpenOrders()

        this.listeners.setEventListeners()

        this.draw()
        // Right padding
        this.svg.call(this.zoom.translateBy, -100)
    }

    draw() {
        let candles = this.data.candles.slice(-300, this.data.candles.length)

        let xdomain = [candles[0].date, candles.last.date]
        let ydomain = [d3.min(candles, d => d.low), d3.max(candles, d => d.high)]

        // Padding y axis
        ydomain[0] -= 50
        ydomain[1] += 50

        this.scales.x.domain(xdomain)
        this.scales.y.domain(ydomain)

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
}
