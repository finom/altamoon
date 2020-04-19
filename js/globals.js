'use strict'
globalThis.d3 = require('d3')
globalThis.OUT = console.log
globalThis.SYMBOL = 'BTC' + 'USDT'

const EventEmitter = require('events')
globalThis.events = new EventEmitter()

// Add Array.last property to access the last item of the array
if (!Array.prototype.last)
Object.defineProperty(Array.prototype, 'last', {
    get: function () { return this[this.length - 1] },
    set: function (item) { this[this.length - 1] = item },
    enumerable: true
})
// Add Array.lastIndex
if (!Array.prototype.lastIndex)
    Object.defineProperty(Array.prototype, 'lastIndex', {
        get: function () { return this.length - 1 },
        enumerable: true
    })
