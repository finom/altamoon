'use strict'
const api = require('../api-futures')

api.onTradeUpdate.push(updateTrades)

var data = []
var table = d3.select('#trades').append('div')
        .attr('class', 'table')

function updateTrades (d) {
    data.unshift(d)
    if (data.length > 10) data.pop()

    table.selectAll('.table > div')
        .data(data)
        .join(
            enter => enter.append('div')
                .attr('class', d => 'row ' + ((d.m) ? 'sell' : 'buy'))
                .call(row => {
                    row.selectAll('div')
                        .data(d => [d.p, d.q])
                        .join('div')
                            .html(d => d)
            }),
            update => update
                .call(row => {
                    row.attr('class', d => 'row ' + ((d.m) ? 'sell' : 'buy'))
                    row.selectAll('div')
                        .data(d => [d.p, d.q])
                        .join('div')
                            .html(d => d)
            })
    )
}
