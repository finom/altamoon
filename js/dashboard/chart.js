'use strict'
const techan = require('techan')
const api = require('../api-futures')

module.exports = {
    draw,
    get draftLinesData () { return draftLinesData }
}

var margin = { top: 0, right: 55, bottom: 30, left: 55 }
var width = 960 - margin.left - margin.right
var height = 600 - margin.top - margin.bottom

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

// --- PREPARE SVG CONTAINERS --- //
var svg = d3.select('#chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

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

// --- LOAD DATA --- //
var candles
var priceLineData = []
var positionLineData = []
var bidAskLinesData = []
var liquidationLineData = []
var orderLinesData = []
var draftLinesData = []

var lastCandlesURL = 'https://fapi.binance.com/fapi/v1/klines?symbol=' + SYMBOL.toLowerCase() + '&limit=1500&interval=1m'

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

// --- INIT DRAW --- //
function initDraw() {
    draw()
    initialZoom()

    api.getPosition()
    api.getOpenOrders()

    api.onPriceUpdate.push(updatePrice)
    api.onPositionUpdate.push(updatePosition)
    api.onOrderUpdate.push(updateOpenOrders)
    api.onBidAskUpdate.push(updateBidAsk)

    streamLastCandle()
}

// --- RENDER CHART --- //
function draw() {
    var data = candles.slice(-300, candles.length)
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

    svg.call(zoom)
        .on('dblclick.zoom', null)
        .on('dblclick', function () {
            placeOrderDraft(y.invert(d3.mouse(this)[1]))
        })

    // Color hack for position and order lines
    gPositionLine.selectAll('.position-line > g')
        .attr('class', d => 'data scope-supstance ' + d.side.toLowerCase())
    gOrderLines.selectAll('.order-lines > g')
        .attr('class', function (d) {
            this.classList.add(d.side.toLowerCase())
            return this.className.baseVal
        })
}

function initialZoom() {
    // add right padding
    svg.call(zoom.translateBy, -100)
}

// --- EVENT HANDLERS --- //
function onZoom(direction = 'x') {
    if (direction == 'x') {
        var scaledX = d3.event.transform.rescaleX(x)
        xAxis.scale(scaledX)
        xGridlines.scale(scaledX)
        plot.xScale(scaledX)
    }
    draw()
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

    var order = (d.side == 'BUY')
        ? api.binance.futuresBuy
        : api.binance.futuresSell

    order(d.symbol, d.qty, d.value.toFixed(2), {'timeInForce': 'GTX'})
        .catch(error => console.error(error))
}

function onDragDraft (d) {
    var price = d.value.toFixed(2)
    var lastPrice = (api.lastPrice)
            ? api.lastPrice
            : candles[candles.length - 1].close
    var side = (price <= lastPrice) ? 'buy' : 'sell'
    var qty = d3.select('.' + side + ' .qty').property('value')

    draftLinesData[0].value = price
    draftLinesData[0].side = side
    draftLinesData[0].qty = Number(qty)


    // Update price input
    var input = d3.select('.' + d.side + ' .price')
    input.property('value', price)

    new Event('input')
    input.dispatch('input', { 'bubbles': true, 'cancelable': true })

    gDraftLabels.call(lineLabel, draftLinesData, 'draft')
}

// --- DATA UPDATE CALLBACKS --- //
function updatePrice (price) {
    priceLineData = [{value: price}]
    gPriceLine.datum(priceLineData).call(lines)
}

function updatePosition (positions) {
    var position = positions.filter(x => x.symbol == SYMBOL)[0]

    if (position && position.liquidation)
        liquidationLineData = [{value: position.liquidation}]
    else liquidationLineData = []

    positionLineData = (position) ? [position] : []
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

// --- STREAM CANDLES (WEBSOCKET) --- //
function streamLastCandle () {
    var stream = new WebSocket(api.wsURL + '@kline_1m')

    stream.onmessage = event => {
        var d = JSON.parse(event.data).k

        var newCandle = {
                date: new Date(d.t),
                open: parseFloat(d.o),
                high: parseFloat(d.h),
                low: parseFloat(d.l),
                close: parseFloat(d.c),
                volume: parseFloat(d.q) }

        var lastCandle = candles[candles.length - 1]

        if (newCandle.date > lastCandle.date) {
            candles.push(newCandle)
        } else {
            candles[candles.length - 1] = newCandle
        }
        draw()
    }
}

// --- CHART ITEM GENERATORS --- //
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

                g.attr('class', d => d.side.toLowerCase())

                // Cancel order on click
                if (type == 'order')
                    rect.on('click', d =>  api.cancelOrder(d.id))
                if (type == 'draft') {
                    rect.on('click', (d, i) => {
                        draftToOrder(d, i)
                    })
                    selection
                        .call(d3.drag()
                            // .on('drag', onDragDraft)
                            // .on('end', onDragDraftEnd)
                        )
                }
            }),
            // Update y
            update => update.call(g => {
                let rect = g.select('rect')
                    .attr('y', d => y(d.value) - 10)
                g.select('text')
                    .attr('y', d => y(d.value) + 3)
                    .text(d => +d.qty)
                g.attr('class', d => d.side.toLowerCase())

                if (type == 'draft') {
                    rect.on('click', (d, i) => {
                        draftToOrder(d, i)
                    })
                }
            })
        )
    return selection
}

function placeOrderDraft (price) {
    price = Number(price).toFixed(2)
    var lastPrice = (api.lastPrice)
            ? api.lastPrice
            : candles[candles.length - 1].close
    var side = (price <= lastPrice) ? 'buy' : 'sell'
    var qty = d3.select('.' + side + ' .qty').property('value')

    draftLinesData = [{ value: price, qty: Number(qty), side: side }]
    draw()

    d3.select('.' + side + ' .price').property('value', price)
}

function draftToOrder (d, i) {
    draftLinesData.splice(i, 1)

    var price = Number(d.value).toFixed(2)
    var order = (d.side == 'buy')
        ? api.binance.futuresBuy
        : api.binance.futuresSell

    order(SYMBOL, d.qty, price, {'timeInForce': 'GTX'})
        .catch(error => console.error(error))
    draw()
}
