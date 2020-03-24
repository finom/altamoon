'use strict'
const api = require('../api-futures')
const { getPnl } = require('../stats')

api.onPositionUpdate.push(updatePositions)
api.onOrderUpdate.push(updateOrders)
api.onPriceUpdate.push(updatePnl)

function updatePnl () {
    var openPositions = api.positions.filter(x => x.qty != 0)
    if (openPositions.length)
        updatePositions(openPositions)
}

function updatePositions (positions) {
    var format = d3.format(',.2f')
    var formatPercent = d3.format(',.1%')

    var openPositions = positions.filter(x => x.qty != 0)

    var rows = d3.select('#positions tbody').selectAll('tr')
        .data(openPositions, d => d.symbol)
        .join(
            enter => enter.append('tr').call(row => {
                row.attr('class', d => d.side)

                var pnl = format(getPnl().pnl)
                var pnlPercent = formatPercent(getPnl().percent)

                var td = () => row.append('td')
                td().text(d => d.symbol.slice(0,3))
                td().text(d => d.qty)
                td().text(d => format(d.price))
                td().text(d => format(d.liquidation))
                td().text(d => format(d.margin))
                td().text(d => `${ pnl } (${ pnlPercent })`)
                td().append('button')
                    .on('click', d => api.closePosition(d.symbol))
                    .html('Market')
            }),
            update => update.call(row => {
                row.attr('class', d => d.side)

                var pnl = format(getPnl().pnl)
                var pnlPercent = formatPercent(getPnl().percent)

                var td = (i) => row.select('td:nth-child(' + i + ')')
                td(1).text(d => d.symbol.slice(0,3))
                td(2).text(d => d.qty)
                td(3).text(d => format(d.price))
                td(4).text(d => format(d.liquidation))
                td(5).text(d => format(d.margin))
                td(6).text(d => `${ pnl } (${ pnlPercent })`)
                row.select('button')
                    .on('click', d => api.closePosition(d.symbol))
            }),
            exit => exit
                .classed('disabled', true)
                .transition()
                    .style('background-color', '#222222')
                .remove()
        )
}

function updateOrders (orders) {
    orders.sort((a, b) => b.price - a.price)

    var rows = d3.select('#orders tbody').selectAll('tr')
        .data(orders, d => d.id)
        .join(
            enter => enter.append('tr').call(row => {
                row.attr('class', d => d.side)
                var td = () => row.append('td')
                td().text(d => d.side)
                td().text(d => d.qty)
                td().text(d => d3.format(',.2~f')(d.price))
                td().text(d => d.filledQty)
                td().text(d => d.type.toLowerCase())
                td().text(d => d.stopPrice)
                td().text(d => d.reduceOnly)
                td().append('button')
                    .on('click', d => api.cancelOrder(d.id))
                    .html('X')
            }),
            update => update.call(row => {
                row.attr('class', d => d.side)
                var td = (i) => row.select('td:nth-child(' + i + ')')
                td(1).text(d => d.side)
                td(2).text(d => d.qty)
                td(3).text(d => d3.format(',.2~f')(d.price))
                td(4).text(d => d.filledQty)
                td(5).text(d => d.type.toLowerCase())
                td(6).text(d => d.stopPrice)
                td(7).text(d => d.reduceOnly)
                row.select('button')
                    .on('click', d => api.cancelOrder(d.id))
            }),
            exit => exit
                .classed('disabled', true)
                .transition()
                    .style('background-color', '#222222')
                .transition()
                    .delay(1000)
                    .duration(1000)
                    .style('opacity', 0.01)
                .remove()
        )
}
