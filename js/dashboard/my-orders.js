const fapi = require('../fapi.js')

fapi.onOrderUpdate.push(updateOrdersList)

function updateOrdersList (orders) {

    orders.sort((a, b) => b.price - a.price)

    rows = d3.select('#orders tbody').selectAll('tr')
        .data(orders, d => d.id)
        .join(
            enter => enter.append('tr').call(row => {
                row.attr('class', d => d.side.toLowerCase())
                row.append('td').text(d => d.side)
                row.append('td').text(d => d.qty)
                row.append('td').text(d => d.price)
                row.append('td').text(d => d.filledQty)
                row.append('td').text(d => d.type)
                row.append('td').text(d => d.stopPrice)
                row.append('td').text(d => d.reduceOnly)
                row.append('td').append('button')
                    .on('click', d => fapi.cancelOrder(d.id))
                    .html('X')
            }),
            update => update.call(row => {
                row.attr('class', d => d.side.toLowerCase())
                row.select('td:nth-child(1)').text(d => d.side)
                row.select('td:nth-child(2)').text(d => d.qty)
                row.select('td:nth-child(3)').text(d => d.price)
                row.select('td:nth-child(4)').text(d => d.filledQty)
                row.select('td:nth-child(5)').text(d => d.type)
                row.select('td:nth-child(6)').text(d => d.stopPrice)
                row.select('td:nth-child(7)').text(d => d.reduceOnly)
                row.select('button')
                    .on('click', d => fapi.cancelOrder(d.id))
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
