/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'
events.on('api.newTrade', updateTrades)

let data = []
let table = d3.select('#trades').append('table')


table.append('tr').selectAll('th')
    .data(['Price', 'Amount', '₮ Value'])
    .enter().append('th')
        .html(d => d)

function updateTrades (d) {
    d.value = d.price * d.amount

    if (d.value < 10)
        return // Hide small trades under $10

    d.value = (d.value >= 10000)
            ? nFormat('.2s', d.value)
            : nFormat(',d', d.value)

    data.unshift(d)
    if (data.length > 30) data.pop()

    table.selectAll('tr:not(:first-child)')
        .data(data)
        .join(
            enter => enter.append('tr')
                .class(d => ((d.maker) ? 'sell' : 'buy'))
                .call(row => {
                    row.selectAll('td')
                        .data(d => [d.price, d.amount, d.value])
                        .enter().append('td')
                            .html(d => d)
            }),
            update => update
                .call(row => {
                    row.class(d => ((d.maker) ? 'sell' : 'buy'))
                    row.selectAll('td')
                        .data(d => [d.price, d.amount, d.value])
                            .html(d => d)
            })
    )
}
