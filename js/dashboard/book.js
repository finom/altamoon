'use strict'
const api = require('../api-futures')
exports.updateBook = updateBook

events.on('api.bookUpdate', assembleBook)

let book

let mainDiv = d3.select('#book').append('div')
        .attr('class', 'something')
let bids = mainDiv.append('div').attr('class', 'bids')
let asks = mainDiv.append('div').attr('class', 'asks')

let timer = 0
let timer2 = 0

async function getSnapshot () {
    if (Date.now() < timer + 2000) return // API rate limit
    timer = Date.now()

    await api.lib.futuresDepth(SYMBOL)
        .then(r => book = r)
}

async function updateBook (d) {
    if (timer2 && Date.now() < timer2 + 100) return
    timer2 = Date.now()

    if (!book)
        await getSnapshot() // Initial data

    bids.selectAll('.bids > div')
        .data(book.bids.slice(0,13), d => d[0])
        .join(
            enter => enter.append('div')
                .attr('class', 'row')
                .call(row => {
                    let cell = () => row.append('div').attr('class', 'cell')
                    cell().html(d => d[1])
                    cell().html(d => d[0])
            }),
            update => update.call(row => {
                row.select('.cell').html(d => d[1])
                row.select('.cell:last-child').html(d => d[0])
            })
        )

    asks.selectAll('.asks > div')
        .data(book.asks.slice(0,13), d => d[0])
        .join(
            enter => enter.append('div')
                .attr('class', 'row')
                .call(row => {
                    let cell = () => row.append('div').attr('class', 'cell')
                    cell().html(d => d[0])
                    cell().html(d => d[1])
                }),
            update => update.call(row => {
                row.select('.cell').html(d => d[0])
                row.select('.cell:last-child').html(d => d[1])
            })
        )
}

let started = false
let buffer = []
let lastEvent

function assembleBook (d) {
    /* Following complicated instructions from Binance API docs */
    buffer.push(d)

    for (let i = 0; i < buffer.length; i++) {
        let item = buffer[i]
        if (item.u < book.lastUpdateId) {
            lastEvent = item
            buffer.splice(i, 1)
            i--
            continue
        }
        if (!started && d.U > book.lastUpdateId) {
            started = true
            lastEvent = item
            getSnapshot()
            return
        }
        if (item.pu != lastEvent.u) {
            started = false
            lastEvent = item
            buffer.splice(i, 1)
            i--
            return
        }
        lastEvent = item
        item = { 'bids': item.b, 'asks': item.a }

        // Event is ok so treat it against book
        for (let [key, side] of Object.entries(item)) {
            let sort = false
            let bookSide = book[key]

            for (let j = side.length -1; j >= 0; j--) {
                let level = side[j]
                let oldIndex = bookSide.findIndex(y => y[0] == level[0])

                if (level[1] == 0 && oldIndex >= 0) {
                    bookSide.splice(oldIndex, 1)
                }
                else if (oldIndex >= 0) {
                    bookSide[oldIndex] = level
                }
                else if (level[1] != 0) {
                    bookSide.push(level)
                    sort = true
                }
            }
            if (sort) {
                let order = (key == 'bids') ? 1 : -1
                bookSide.sort((a,b) => order * b[0] - a[0] * order)
            }
        }
        buffer.splice(i, 1)
        i--
    }
    updateBook()
}
