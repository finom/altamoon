const techan = require('techan')
const fapi = require('../fapi.js')

module.exports.drawChart = function (container) {
    var margin = { top: 0, right: 55, bottom: 30, left: 55 }
    var width = 960 - margin.left - margin.right
    var height = 600 - margin.top - margin.bottom

    var x = d3.scaleTime()
            .range([0, width])

    var y = d3.scaleLinear()
            .range([height, 0])

    var zoom = d3.zoom()
            .on('zoom', onZoom)

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

    var crosshair = techan.plot.crosshair()
            .xScale(x)
            .yScale(y)
            .xAnnotation(axisLabelBottom)
            .yAnnotation([axisLabelLeft, axisLabelRight])

    // Plot
    var plot = techan.plot.candlestick()
            .xScale(x)
            .yScale(y)

    var svg
    var candles
    var priceLineData
    var positionLineData = []
    var openOrders = {}
    var orderLinesData = []

    //// PREPARE SVG
    function prepareSVG () {
        svg = d3.select(container).append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
            .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        svg.append('clipPath')
                .attr('id', 'clip')
            .append('rect')
                .attr('x', 0)
                .attr('y', y(1))
                .attr('width', width)
                .attr('height', y(0) - y(1))

        svg.append('g').attr('class', 'x gridlines')
        svg.append('g').attr('class', 'y gridlines')

        svg.append('g').attr('class', 'x axis bottom')
                .attr('transform', 'translate(0,' + height + ')')

        svg.append('g').attr('class', 'y axis left')
        svg.append('g').attr('class', 'y axis right')
                .attr('transform', 'translate(' + width + ',0)')

        svg.append('g').attr('class', 'position-line')
        svg.append('g').attr('class', 'order-lines')
        svg.append('g').attr('class', 'price-line')

        svg.append('g').attr('class', 'plot')
                .attr('clip-path', 'url(#clip)')

        svg.append('g').attr('class', 'crosshair')

        svg.append('g').attr('class', 'order-labels')

        gPositionLabel = svg.append('g').attr('class', 'position-label')
        gPositionLabel.append('rect')
                .style('display', 'none')
        gPositionLabel.append('text')
    }

    //// LOAD DATA
    var lastCandlesURL = 'https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&limit=1500&interval=1m'

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

    //// INIT DRAW
    function initDraw() {
        prepareSVG()
        draw()
        initialZoom()

        fapi.onGetPosition.push(updatePosition)
        fapi.getPosition()

        fapi.onGetOpenOrders.push(updateOpenOrders)
        fapi.getOpenOrders()

        streamLastCandle()

        fapi.onNewUserData.push(onPositionUpdate, onOrderUpdate)
    }

    //// RENDER CHART
    function draw() {
        var data = candles.slice(-350, candles.length)
        var accessor = plot.accessor()

        var xdomain = d3.extent(data.map(accessor.d))
        var ydomain = techan.scale.plot.ohlc(data, accessor).domain()

        // Padding y axis
        ydomain[0] -= 20
        ydomain[1] += 20

        x.domain(xdomain)
        y.domain(ydomain)

        priceLineData = [{ value: candles[candles.length -1].close }]

        gXGridlines = svg.select('g.x.gridlines').call(xGridlines)
        gYGridlines = svg.select('g.y.gridlines').call(yGridlines)

        gX = svg.select('g.x.axis.bottom').call(xAxis)
        gYLeft  = svg.select('g.y.axis.left').call(yAxisLeft)
        gYRight = svg.select('g.y.axis.right').call(yAxisRight)

        svg.select('g.price-line').datum(priceLineData).call(lines)
        svg.select('g.order-lines').datum(orderLinesData).call(orderLines)
        svg.select('g.position-line').datum(positionLineData).call(lines)

        gPositionLabel.select('rect')
                .data(positionLineData)
                .attr('x', width - 80)
                .attr('y', d => y(d.value) - 10)
                .style('display', 'block')
        gPositionLabel.select('text')
                .data(positionLineData)
                .text(d => +d.qty)
                .attr('x', width - 75)
                .attr('y', d => y(d.value) + 3)

        //// ORDER LABELS
        var orderLabels = svg.select('g.order-labels').selectAll('g')
                .data(orderLinesData)

        let gLabel = orderLabels.enter().append('g')

        // Enter
        gLabel.append('rect')
                .attr('x', width - 80)
                .attr('y', d => y(d.value) - 10)
                .on('click', d =>  fapi.cancelOrder(d.id))
        gLabel.append('text')
                .text(d => +d.qty)
                .attr('x', width - 75)
                .attr('y', d => y(d.value) + 3)
        // Update
        orderLabels.select('g rect')
                .attr('y', d => y(d.value) - 10)
        orderLabels.select('g text')
                .text(d => +d.qty)
                .attr('y', d => y(d.value) + 3)
        // Exit
        orderLabels.exit().remove()
        ////

        gPlot = svg.selectAll('g.plot').datum(data).call(plot)

        svg.selectAll('g.crosshair').call(crosshair)

            .call(zoom)
    }

    function initialZoom() {
        // add right padding
        svg.call(zoom.translateBy, -100)
    }

    function onZoom(direction='x') {
        if (direction == 'x') {
            var scaledX = d3.event.transform.rescaleX(x)
            gX.call(xAxis.scale(scaledX))
            gXGridlines.call(xGridlines.scale(scaledX))
            gPlot.call(plot.xScale(scaledX))
        }
    }

    //// DATA UPDATES (REST)
    function updatePosition (data) {
        data = data.BTCUSDT

        positionLineData = [{
            value: data.entryPrice,
            qty: data.positionAmt
        }]
        draw()
    }

    function updateOpenOrders (data) {
        openOrders = data

        orderLinesData = data.map(d => {
            return {
                id: d.orderId,
                value: d.price,
                qty: d.origQty,
            }
        })
        draw()
    }

    //// STREAMING DATA UPDATES (WEBSOCKET)
    function streamLastCandle () {
        var stream = new WebSocket('wss://fstream.binance.com/ws/btcusdt@kline_1m')

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

    function onPositionUpdate (data) {
        if (data.e != 'ACCOUNT_UPDATE') return

        var positionData = data.a.P[0]

        positionLineData = [{value: positionData.ep, qty: positionData.pa}]
        draw()
    }

    function onOrderUpdate (data) {
        if (data.e != 'ORDER_TRADE_UPDATE') return

        var order = data.o

        // New limit order
        if (order.X == 'NEW' && order.o == 'LIMIT') {
            openOrders[order.i] = order
            orderLinesData.push({id: order.i, value: order.p, qty: order.q})
            draw()
            return
        }

        // Removed limit order
        if (order.o == 'LIMIT' && ['CANCELED', 'EXPIRED', 'FILLED'].indexOf(order.X) >= 0) {
            delete openOrders[order.i]
            index = orderLinesData.findIndex(x => x.id == order.i)
            if (typeof index != 'undefined') {
                orderLinesData.splice(index, 1)
                draw()
            }
        }
    }
    ////
}
