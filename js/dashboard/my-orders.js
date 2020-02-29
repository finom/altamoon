const fapi = require('../fapi.js')

fapi.onGetOpenOrders.push(updateOrdersList)


function updateOrdersList (orders) {
    divs = d3.select('#orders').selectAll('div')
        .data(orders)

    divs.enter().append('div')
        .text(d => 'Entry: ' + d.price + ' | Amount:' + d.origQty)

    // divs.exit().remove()
}
