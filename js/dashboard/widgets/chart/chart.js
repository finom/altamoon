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


let margin = { top: 0, right: 55, bottom: 30, left: 55 }
let width = 960 - margin.left - margin.right
let height = 700 - margin.top - margin.bottom

let scales = {
    x: d3.scaleTime().range([0, width]),
    y: d3.scaleSymlog().range([height, 0])
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   CREATE ITEMS
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
let svg = new Svg(width, height, margin)

let axes = new Axes(scales, width, height)

let gridLines = new GridLines(scales, width, height)

let clipPath = new ClipPath(width, height)

let linesArgs = [scales, axes, width, height, margin]
let priceLine = new Lines(...linesArgs)
let bidAskLines = new Lines(...linesArgs)
let draftLines = new Lines(...linesArgs)
let orderLines = new Lines(...linesArgs)
let positionLine = new Lines(...linesArgs)
let liquidationLine = new Lines(...linesArgs)

let positionLabel = new LineLabels(width, scales.y)
let orderLabels = new LineLabels(width, scales.y)
let draftLabels = new LineLabels(width, scales.y)

let plot = new Plot(scales)

let crosshair = new Crosshair(scales, axes, width, height)

let zoom = d3.zoom()

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   APPEND SVG CONTAINERS
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
/* Order of appending = visual z-order (last is top) */
svg.appendTo('#chart')

clipPath.appendTo(svg, 'clipChart')

gridLines.appendTo(svg)

axes.appendTo(svg)

positionLine.appendTo(svg, 'position-line')
liquidationLine.appendTo(svg, 'liquidation-line')
bidAskLines.appendTo(svg, 'bid-ask-lines')
priceLine.appendTo(svg, 'price-line')

plot.appendTo(svg)

crosshair.appendTo(svg)

orderLines.appendTo(svg, 'order-lines')
draftLines.appendTo(svg, 'draft-lines')

positionLabel.appendTo(svg, 'position-label')
orderLabels.appendTo(svg, 'order-labels')
draftLabels.appendTo(svg, 'draft-labels')

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   LOAD DATA
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
let candles = []
let priceLineData = []
let positionLineData = []
let bidAskLinesData = []
let liquidationLineData = []
let orderLinesData = []
let draftLinesData = []

api.getCandles()
events.on('api.candlesUpdate', initDraw)

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   EVENT LISTENERS
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
let listeners = new Listeners(
    candles,
    { priceLineData, positionLineData, bidAskLinesData, liquidationLineData, orderLinesData, draftLinesData, },
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
)

draftLines.on('drag', listeners.onDragDraft)
orderLines.on('drag', listeners.onDragOrder)
        .on('dragend', listeners.onDragOrderEnd)
draftLabels.on('click', (d, i) => listeners.draftToOrder(d, i))
orderLabels.on('click', d => api.cancelOrder(d.id))

svg.call(zoom)
svg.on('dblclick.zoom', null)
        .on('dblclick', function () {
            listeners.placeOrderDraft(scales.y.invert(d3.mouse(this)[1]))
        })

zoom.on('zoom', listeners.onZoom)

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   INIT DRAW
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function initDraw(_candles) {
    candles.push(..._candles)

    api.getPosition()
    api.getOpenOrders()

    listeners.setEventListeners()

    draw()
    // Right padding
    svg.call(zoom.translateBy, -100)
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   RENDER CHART
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function draw() {
    let data = candles.slice(-300, candles.length)

    let xdomain = [data[0].date, data.last.date]
    let ydomain = [d3.min(data, d => d.low), d3.max(data, d => d.high)]

    // Padding y axis
    ydomain[0] -= 50
    ydomain[1] += 50

    scales.x.domain(xdomain)
    scales.y.domain(ydomain)

    axes.draw()

    gridLines.draw(scales.y)

    priceLine.draw(priceLineData)
    positionLine.draw(positionLineData)
    bidAskLines.draw(bidAskLinesData)
    liquidationLine.draw(liquidationLineData)
    orderLines.draw(orderLinesData).draggable()
    draftLines.draw(draftLinesData).draggable()

    positionLabel.draw(positionLineData)
    orderLabels.draw(orderLinesData)
    draftLabels.draw(draftLinesData)

    crosshair.draw()

    plot.draw(candles)

    // Color lines based on market side
    positionLine.wrapper.selectAll('.position-line > g')
        .attr('data-side', d => d.side)
    orderLines.wrapper.selectAll('.order-lines > g')
        .attr('data-side', d => d.side)
    draftLines.wrapper.selectAll('.draft-lines > g')
        .attr('data-side', d => d.side)
}
