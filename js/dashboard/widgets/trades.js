'use strict'
events.on('api.newTrade', updateTrades)

let data = []
let table = d3.select('#trades').append('div')
        .class('table')

let timer = 0
function updateTrades (d) {
    data.unshift(d)
    if (data.length > 30) data.pop()

    if (Date.now() < timer + 16) return // throttle redraw to 60 fps
    timer = Date.now()

    table.selectAll('.table > div')
        .data(data)
        .join(
            enter => enter.append('div')
                .class(d => 'row ' + ((d.maker) ? 'sell' : 'buy'))
                .call(row => {
                    row.selectAll('div')
                        .data(d => [d.price, d.amount])
                        .enter().append('div')
                            .html(d => d)
            }),
            update => update
                .call(row => {
                    row.class(d => 'row ' + ((d.maker) ? 'sell' : 'buy'))
                    row.selectAll('div')
                        .data(d => [d.price, d.amount])
                            .html(d => d)
            })
    )
}
