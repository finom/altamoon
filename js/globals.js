/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'
const EventEmitter = require('events')
const {config} = require('./config')

globalThis.events = new EventEmitter()
globalThis.d3 = require('d3')
globalThis.OUT = console.log
globalThis.SYMBOL = config.get('symbol')
globalThis.nFormat = (f, n) => d3.format(f)(n)


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
