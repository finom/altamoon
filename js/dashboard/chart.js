'use strict'
const techan = require('techan')
const api = require('../api-futures')
const trading = require('./trading')
const { getLiquidation } = require('../stats')

module.exports = {
    draw,
    get draftLinesData () { return draftLinesData }
}

var margin = { top: 0, right: 55, bottom: 30, left: 55 }
var width = 960 - margin.left - margin.right
var height = 700 - margin.top - margin.bottom

var x = d3.scaleTime().range([0, width])
var y = d3.scaleLinear().range([height, 0])

var zoom = d3.zoom().on('zoom', onZoom)

var xAxis = d3.axisBottom(x)
var yAxisLeft = d3.axisLeft(y)
var yAxisRight = d3.axisRight(y)

var xGridlines = d3.axisTop(x)
        .tickFormat('')
        .tickSize(-height)

var yGridlines = d3.axisLeft(y)
        .tickFormat('')
        .tickSize(-width)

var axisLabelBottom = techan.plot.axisannotation()
        .axis(xAxis)
        .orient('bottom')
        .format(d3.timeFormat('%-d/%-m/%Y %-H:%M:%S'))
        .width(94)
        .translate([0, height])

var axisLabelLeft = techan.plot.axisannotation()
        .axis(yAxisLeft)
        .orient('left')
        .format(d3.format(',.2f'))

var axisLabelRight = techan.plot.axisannotation()
        .axis(yAxisRight)
        .orient('right')
        .format(d3.format(',.2f'))
        .translate([width, 0])

var lines = techan.plot.supstance()
        .xScale(x)
        .yScale(y)
        .annotation([axisLabelLeft, axisLabelRight])

var orderLines = techan.plot.supstance()
        .xScale(x)
        .yScale(y)
        .annotation([axisLabelLeft, axisLabelRight])
        .on('drag', onDragOrder)
        .on('dragend', onDragOrderEnd)

var draftLines = techan.plot.supstance()
        .xScale(x)
        .yScale(y)
        .annotation([axisLabelLeft, axisLabelRight])
        .on('drag', onDragDraft)

var crosshair = techan.plot.crosshair()
        .xScale(x)
        .yScale(y)
        .xAnnotation(axisLabelBottom)
        .yAnnotation([axisLabelLeft, axisLabelRight])

var plot = techan.plot.candlestick()
        .xScale(x)
        .yScale(y)

// -----------------------------------------------------------------------------
//   PREPARE SVG CONTAINERS
// -----------------------------------------------------------------------------
var svg = d3.select('#chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

svg.call(zoom)

svg.on('dblclick.zoom', null)
    .on('dblclick', function () {
        placeOrderDraft(y.invert(d3.mouse(this)[1]))
    })

var gClipPath = svg.append('clipPath')
        .attr('id', 'clip')
    .append('rect')
        .attr('x', 0)
        .attr('y', y(1))
        .attr('width', width)
        .attr('height', y(0) - y(1))

var gXGridlines = svg.append('g').attr('class', 'x gridlines')
var gYGridlines = svg.append('g').attr('class', 'y gridlines')

var gXAxis = svg.append('g').attr('class', 'x axis bottom')
        .attr('transform', 'translate(0,' + height + ')')

var gYAxisLeft = svg.append('g').attr('class', 'y axis left')
var gYAxisRight = svg.append('g').attr('class', 'y axis right')
        .attr('transform', 'translate(' + width + ',0)')

var gPositionLine = svg.append('g').attr('class', 'position-line')
var gLiquidationLine = svg.append('g').attr('class', 'liquidation-line')
        .attr('clip-path', 'url(#clip)')
var gBidASkLines = svg.append('g').attr('class', 'bid-ask-lines')
var gPriceLine = svg.append('g').attr('class', 'price-line')

var gPlot = svg.append('g').attr('class', 'plot')
        .attr('clip-path', 'url(#clip)')

var gCrosshair = svg.append('g').attr('class', 'crosshair')

var gOrderLines = svg.append('g').attr('class', 'order-lines')
var gDraftLines = svg.append('g').attr('class', 'draft-lines')

var gPositionLabel = svg.append('g').attr('class', 'position-label')
        .attr('clip-path', 'url(#clip)')
var gOrderLabels = svg.append('g').attr('class', 'order-labels')
        .attr('clip-path', 'url(#clip)')
var gDraftLabels = svg.append('g').attr('class', 'draft-labels')
        .attr('clip-path', 'url(#clip)')

// -----------------------------------------------------------------------------
//   LOAD DATA
// -----------------------------------------------------------------------------
var candles
var priceLineData = []
var positionLineData = []
var bidAskLinesData = []
var liquidationLineData = []
var orderLinesData = []
var draftLinesData = []

var lastCandlesURL = 'https://fapi.binance.com/fapi/v1/klines?symbol=' + SYMBOL + '&limit=1500&interval=1m'

d3.json(lastCandlesURL)
    .then(jsonCandles => {
        var accessor = plot.accessor()

        candles = jsonCandles
            .map(d => {
                return {
                    date: new Date(+d[0]),
                    open: +d[1],
                    high: +d[2],
                    low: +d[3],
                    close: +d[4],
                    volume: +d[7]
                }
            })
            .sort((a, b) => d3.ascending(accessor.d(a), accessor.d(b)))

        // Draw with initial data
        initDraw()
    })
    .catch(e => console.error(e))

// -----------------------------------------------------------------------------
//   INIT DRAW
// -----------------------------------------------------------------------------
function initDraw() {
    draw()
    // Right padding
    svg.call(zoom.translateBy, -100)

    api.getPosition()
    api.getOpenOrders()

    api.events.on('priceUpdate', updatePrice)
    api.events.on('positionUpdate', updatePosition)
    api.events.on('orderUpdate', updateOpenOrders)
    api.events.on('bidAskUpdate', updateBidAsk)

    streamLastCandle()
}

// -----------------------------------------------------------------------------
//   RENDER CHART
// -----------------------------------------------------------------------------
function draw() {
    var data = candles.slice(-350, candles.length)
    var accessor = plot.accessor()

    var xdomain = d3.extent(data.map(accessor.d))
    var ydomain = techan.scale.plot.ohlc(data, accessor).domain()

    // Padding y axis
    ydomain[0] -= 80
    ydomain[1] += 80

    x.domain(xdomain)
    y.domain(ydomain)

    gXGridlines.call(xGridlines)
    gYGridlines.call(yGridlines)

    gXAxis.call(xAxis)
    gYAxisLeft.call(yAxisLeft)
    gYAxisRight.call(yAxisRight)

    gPriceLine.datum(priceLineData).call(lines)
    gPositionLine.datum(positionLineData).call(lines)
    gBidASkLines.datum(bidAskLinesData).call(lines)
    gLiquidationLine.datum(liquidationLineData).call(lines)
    gOrderLines.datum(orderLinesData).call(orderLines).call(orderLines.drag)
    gDraftLines.datum(draftLinesData).call(draftLines).call(draftLines.drag)

    gPositionLabel.call(lineLabel, positionLineData)
    gOrderLabels.call(lineLabel, orderLinesData, 'order')
    gDraftLabels.call(lineLabel, draftLinesData, 'draft')

    gCrosshair.call(crosshair)

    gPlot.datum(data).call(plot)

    // Color lines based on market side
    gPositionLine.selectAll('.position-line > g')
        .attr('data-side', d => d.side)
    gOrderLines.selectAll('.order-lines > g')
        .attr('data-side', d => d.side)
    gDraftLines.selectAll('.draft-lines > g')
        .attr('data-side', d => d.side)
}

// -----------------------------------------------------------------------------
//   DATA UPDATE CALLBACKS
// -----------------------------------------------------------------------------
function updatePrice (price) {
    priceLineData = [{value: price}]
    gPriceLine.datum(priceLineData).call(lines)
}

function updatePosition (positions) {
    var position = positions.filter(x => x.symbol == SYMBOL)[0]

    if (position.qty && position.liquidation)
        liquidationLineData[0] = {value: position.liquidation}
    else liquidationLineData[0] = undefined

    positionLineData = (position.qty) ? [position] : []
    draw()
}

function updateOpenOrders (orders) {
    orderLinesData = orders
    draw()
}

function updateBidAsk (data) {
    if (bidAskLinesData[0]) {
        if (bidAskLinesData[0].value == data.a
            && bidAskLinesData[1].value == data.b)
            return
    }
    bidAskLinesData = [{value: data.a}, {value: data.b}]

    gBidASkLines.datum(bidAskLinesData).call(lines)
}

// -----------------------------------------------------------------------------
//   STREAM CANDLES (WEBSOCKET)
// -----------------------------------------------------------------------------
function streamLastCandle () {
    var stream = new WebSocket(api.wsURL + '@kline_1m')

    stream.onmessage = event => {
        var d = JSON.parse(event.data).k

        var candle = {
                date: new Date(d.t),
                open: parseFloat(d.o),
                high: parseFloat(d.h),
                low: parseFloat(d.l),
                close: parseFloat(d.c),
                volume: parseFloat(d.q) }

        var lastCandle = candles[candles.length - 1]
        var newCandle = false

        if (candle.date > lastCandle.date) {
            candles.push(candle)
            newCandle = true
        } else {
            candles[candles.length - 1] = candle
        }
        draw()

        if (newCandle)
            // Pan chart
            svg.call(zoom.translateBy, 0) // Ehh... ¯\_(°~°)_/¯
    }
}

// -----------------------------------------------------------------------------
//   CHART ITEM GENERATORS
// -----------------------------------------------------------------------------
function lineLabel (selection, data, type) {
    selection.selectAll('g')
        .data(data)
        .join(
            // Add label at y = price
            enter => enter.append('g').call(g => {
                let rect = g.append('rect')
                    .attr('x', width - 80)
                    .attr('y', d => y(d.value) - 10)

                g.append('text')
                    .text(d => +d.qty)
                    .attr('x', width - 75)
                    .attr('y', d => y(d.value) + 3)

                g.attr('data-side', d => d.side)

                // Order
                if (type == 'order')
                    rect.on('click', d =>  api.cancelOrder(d.id))
                // Draft
                if (type == 'draft') {
                    rect.on('click', (d, i) => {
                        draftToOrder(d, i)
                    })
                    // rect.call(d3.drag()
                            // .on('drag', onDragDraft)
                            // .on('end', onDragDraftEnd)
                    // )
                }
            }),
            // Update y
            update => update.call(g => {
                let rect = g.select('rect')
                    .attr('y', d => y(d.value) - 10)
                g.select('text')
                    .attr('y', d => y(d.value) + 3)
                    .text(d => +d.qty)
                g.attr('data-side', d => d.side)

                if (type == 'draft') {
                    rect.on('click', (d, i) => {
                        draftToOrder(d, i)
                    })
                }
            })
        )
    return selection
}

// -----------------------------------------------------------------------------
//   EVENT HANDLERS
// -----------------------------------------------------------------------------
function placeOrderDraft (price) {
    price = +(price.toFixed(2))
    var lastPrice = (api.lastPrice)
            ? api.lastPrice
            : candles[candles.length - 1].close
    var side = (price <= lastPrice) ? 'buy' : 'sell'
    var qty = d3.select('#' + side + '-qty').property('value')

    var data = { value: price, qty: Number(qty), side: side }
    draftLinesData = [data]

    onDragDraft(data) // Wobbly coding <(°v°)<
    draw()
}

function onDragDraft (d) {
    var price = +(d.value.toFixed(2))
    var lastPrice = (api.lastPrice)
            ? api.lastPrice
            : candles[candles.length - 1].close
    var qty = d3.select('#' + d.side + '-qty').property('value')

    draftLinesData[0].value = price
    draftLinesData[0].qty = Number(qty)

    // Update price input
    var input = d3.select('#' + d.side + '-price')
    input.property('value', price)

    new Event('input')
    input.dispatch('input', { 'bubbles': true, 'cancelable': true })

    // Liquidation line
    var direction = (d.side == 'buy') ? 1 : -1
    var liqui = getLiquidation(trading.getMarginCost(d.side), direction, price, qty)
    liquidationLineData[1] = {value: liqui, type: 'draft'}

    // Redraw
    gDraftLabels.call(lineLabel, draftLinesData, 'draft')
    gLiquidationLine.datum(liquidationLineData).call(lines)
    // Set style on liquidation lines
    gLiquidationLine.selectAll('.liquidation-line > g')
        .attr('data-type', d => d.type)
}

function draftToOrder (d, i) {
    draftLinesData.splice(i, 1)
    liquidationLineData.splice(1, 1)
    draw()

    var order = (d.side == 'buy')
        ? trading.onBuy
        : trading.onSell

    order('limit')
}

function onDragOrder (d) {
    var currentOrder = orderLinesData.filter(x => x.id == d.id)[0]
    if (!currentOrder || currentOrder.price == d.value)
        return
    gOrderLabels.call(lineLabel, orderLinesData, 'order')
}
function onDragOrderEnd (d) {
    /* Delete order, recreate at new price */
    var currentOrder = orderLinesData.filter(x => x.id == d.id)[0]
    if (!currentOrder || currentOrder.price == d.value)
        return

    api.cancelOrder(d.id)

    var order = (d.side == 'buy')
        ? api.binance.futuresBuy
        : api.binance.futuresSell

    order(d.symbol, d.qty, d.value.toFixed(2), {
            'reduceOnly': d.reduceOnly,
            'timeInForce': d.timeInForce
        })
        .catch(error => console.error(error))
}

function onZoom(direction = 'x') {
    if (direction == 'x') {
        var scaledX = d3.event.transform.rescaleX(x)
        xAxis.scale(scaledX)
        xGridlines.scale(scaledX)
        plot.xScale(scaledX)
    }
    draw()
}
