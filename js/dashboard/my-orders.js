const fapi = require('../fapi.js')

fapi.onOrderUpdate.push(updateOrdersList)


function updateOrdersList (orders) {
    rows = d3.select('#orders tbody').selectAll('tr:not(:first-child)')
        .data(orders)

    rows.enter().append('tr').call(row => {
        row.attr('class', d => d.side.toLowerCase())
        row.append('td').text(d => d.side)
        row.append('td').text(d => d.qty)
        row.append('td').text(d => d.price)
        row.append('td').text(d => d.filledQty)
        row.append('td').text(d => d.type)
        row.append('td').text(d => d.stopPrice)
        row.append('td').text(d => d.reduceOnly)
    })

    rows.exit().remove()
}
