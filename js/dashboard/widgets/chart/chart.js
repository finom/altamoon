'use strict'
const techan = require('techan')
const api = require('../../../apis/futures')
const trading = require('../trading')

const Crosshair = require('./items/crosshair')
const Plot = require('./plot/plot')
const Lines = require('./items/lines')
const { LineLabel, OrderLabel, DraftLabel } = require('./items/line-label')

const Callbacks = require('./callbacks/callbacks')

let margin = { top: 0, right: 55, bottom: 30, left: 55 }
let width = 960 - margin.left - margin.right
let height = 700 - margin.top - margin.bottom

let xScale = d3.scaleTime().range([0, width])
let yScale = d3.scaleSymlog().range([height, 0])

let zoom = d3.zoom().on('zoom', onZoom)

let xAxis = d3.axisBottom(xScale)

let yAxisLeft = d3.axisLeft(yScale)
        .tickFormat(d3.format('.2f'))

let yAxisRight = d3.axisRight(yScale)
        .tickFormat(d3.format('.2f'))

let xGridlines = d3.axisTop(xScale)
        .tickFormat('')
        .tickSize(-height)

let yGridlines = g => g.call(d3.axisLeft(yScale)
        .tickFormat('')
        .tickSize(-width)
        .tickValues(d3.scaleLinear().domain(yScale.domain()).ticks())
    )

let newLines = () =>  new Lines(xScale, yScale, yAxisLeft, yAxisRight, width)

let priceLine = newLines()
let bidAskLines = newLines()
let draftLines = newLines()
let orderLines = newLines()
let positionLine = newLines()
let liquidationLine = newLines()

let positionLabel = new LineLabel(width, yScale)
let orderLabels = new OrderLabel(width, yScale)
let draftLabels = new DraftLabel(width, yScale, draftToOrder)

let plot = new Plot(xScale, yScale)

let crosshair = new Crosshair(
    xScale, yScale, xAxis, yAxisLeft, yAxisRight, width, height
)

// Data
let candles = []
let priceLineData = []
let positionLineData = []
let bidAskLinesData = []
let liquidationLineData = []
let orderLinesData = []
let draftLinesData = []

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   PREPARE SVG CONTAINERS
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
let svg = d3.select('#chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

svg.call(zoom)

svg.on('dblclick.zoom', null)
    .on('dblclick', function () {
        placeOrderDraft(yScale.invert(d3.mouse(this)[1]))
    })

let gClipPath = svg.append('clipPath')
        .attr('id', 'clip')
    .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)

let gXGridlines = svg.append('g').class('x gridlines')
let gYGridlines = svg.append('g').class('y gridlines')

let gXAxis = svg.append('g').class('x axis bottom')
        .attr('transform', 'translate(0,' + height + ')')

let gYAxisLeft = svg.append('g').class('y axis left')
let gYAxisRight = svg.append('g').class('y axis right')
        .attr('transform', 'translate(' + width + ',0)')

positionLine.appendWrapper(svg, 'position-line')
liquidationLine.appendWrapper(svg, 'liquidation-line')
bidAskLines.appendWrapper(svg, 'bid-ask-lines')
priceLine.appendWrapper(svg, 'price-line')

plot.appendWrapper(svg)
plot.appendWrapper(svg)

crosshair.appendWrapper(svg)

orderLines.appendWrapper(svg, 'order-lines')
        .on('drag', onDragOrder)
        .on('dragend', onDragOrderEnd)
draftLines.appendWrapper(svg, 'draft-lines')
        .on('drag', onDragDraft)

positionLabel.appendWrapper(svg, 'position-label')
orderLabels.appendWrapper(svg, 'order-labels')
draftLabels.appendWrapper(svg, 'draft-labels')

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   LOAD DATA
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
api.getCandles()
events.on('api.candlesUpdate', initDraw)

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   INIT DRAW
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function initDraw(_candles) {
    candles = _candles
    draw()
    // Right padding
    svg.call(zoom.translateBy, -100)
    // svg.call(zoom.translateBy, -200)
    // svg.call(zoom.scaleBy, 1.5)

    api.getPosition()
    api.getOpenOrders()

    // Event listeners
    let callbacks = new Callbacks(
        candles,
        {
            priceLineData,
            positionLineData,
            bidAskLinesData,
            liquidationLineData,
            orderLinesData,
            draftLinesData,
        },
        svg,
        draw,
        plot,
        priceLine,
        bidAskLines,
        liquidationLine,
        zoom,
    )
    events.on('api.lastCandleUpdate', callbacks.updateLastCandle)
    events.on('api.priceUpdate', callbacks.updatePrice)
    events.on('api.bidAskUpdate', callbacks.updateBidAsk)
    events.on('trading.qtyUpdate', callbacks.updateDraft)
    events.on('api.orderUpdate', callbacks.updateOpenOrders)
    events.on('api.positionUpdate', callbacks.updatePosition)
    events.on('liquidation.update', callbacks.updateLiquidation)
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

    xScale.domain(xdomain)
    yScale.domain(ydomain)

    gXAxis.call(xAxis)
    gYAxisLeft.call(yAxisLeft
        .tickValues(d3.scaleLinear().domain(yScale.domain()).ticks())
    )
    gYAxisRight.call(yAxisRight
        .tickValues(d3.scaleLinear().domain(yScale.domain()).ticks())
    )

    gXGridlines.call(xGridlines)
    gYGridlines.call(yGridlines)

    priceLine.draw(priceLineData)
    positionLine.draw(positionLineData)
    bidAskLines.draw(bidAskLinesData)
    liquidationLine.draw(liquidationLineData)
    orderLines.draw(orderLinesData).drag
    draftLines.draw(draftLinesData).drag

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

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   EVENT HANDLERS
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

function placeOrderDraft (price) {
    price = +(price.toFixed(2))
    let lastPrice = (api.lastPrice)
            ? api.lastPrice
            : candles.last.close
    let side = (price <= lastPrice) ? 'buy' : 'sell'
    let qty = d3.select('#' + side + '-qty').property('value')

    let data = { value: price, qty: Number(qty), side: side }
    draftLinesData = [data]

    onDragDraft(data) // Wobbly coding <(°v°)<
    draw()
}

function onDragDraft (d) {
    let price = +(d.value.toFixed(2))
    let qty = d3.select('#' + d.side + '-qty').property('value')

    draftLinesData[0].value = price
    draftLinesData[0].qty = Number(qty)

    events.emit('chart.draftOrderMoved', d.side, price, qty)

    // Redraw
    draftLabels.draw(draftLinesData)
}

function draftToOrder (d, i) {
    draftLinesData.splice(i, 1)

    events.emit('chart.draftOrderMoved', d.side, null, null)

    draw()

    let order = (d.side === 'buy')
        ? trading.onBuy
        : trading.onSell

    order('limit')
}

function onDragOrder (d) {
    let currentOrder = orderLinesData.filter(x => x.id === d.id)[0]
    if (!currentOrder || currentOrder.price === d.value)
        return
    orderLabels.draw(orderLinesData)
}
function onDragOrderEnd (d) {
    /* Delete order, recreate at new price */
    let currentOrder = orderLinesData.filter(x => x.id === d.id)[0]
    if (!currentOrder || currentOrder.price === d.value)
        return

    api.cancelOrder(d.id)

    let order = (d.side === 'buy')
        ? api.lib.futuresBuy
        : api.lib.futuresSell

    order(d.symbol, d.qty, d.value.toFixed(2), {
            'reduceOnly': d.reduceOnly,
            'timeInForce': d.timeInForce
        })
        .catch(error => console.error(error))
}

function onZoom() {
    let transform = d3.event.transform
    let scaledX = transform.rescaleX(xScale)

    xAxis.scale(scaledX)
    xGridlines.scale(scaledX)
    plot.xScale = scaledX

    // let scaledY = transform.rescaleY(yScale)
    // plot.yScale = scaledY
    draw()
}
