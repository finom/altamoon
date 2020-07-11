'use strict'
globalThis.d3 = require('d3')
globalThis.OUT = console.log
globalThis.SYMBOL = 'BTC' + 'USDT'

const EventEmitter = require('events')
globalThis.events = new EventEmitter()

// Add Array.last to access the last item of the array
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

// Add d3.selection.class() shortcut to d3.selection.attr('class')
if (!d3.selection.prototype.class)
    Object.defineProperty(d3.selection.prototype, 'class', {
        value: function (value) {
            if (value !== undefined)
                return this.attr('class', value)
            else
                return this.attr('class')
        },
        enumerable: true
    })

// Add d3.selection.id() shortcut to d3.selection.attr('id')
if (!d3.selection.prototype.id)
    Object.defineProperty(d3.selection.prototype, 'id', {
        value: function (value) {
            if (value !== undefined)
                return this.attr('id', value)
            else
                return this.attr('id')
        },
        enumerable: true
    })

// Add d3.selection.value() shortcut to d3.selection.property('value')
if (!d3.selection.prototype.value)
    Object.defineProperty(d3.selection.prototype, 'value', {
        value: function (value) {
            if (value !== undefined)
                return this.property('value', value)
            else
                return this.property('value')
        },
        enumerable: true
    })
