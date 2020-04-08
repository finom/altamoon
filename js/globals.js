'use strict'
globalThis.d3 = require('d3')
globalThis.OUT = console.log // Haaa :D
globalThis.SYMBOL = 'BTC' + 'USDT'

const EventEmitter = require('events')
globalThis.events = new EventEmitter()
