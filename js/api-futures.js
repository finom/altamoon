'use strict'
const settings = require('../user/settings')
const Binance = require('node-binance-api')
const lib = new Binance().options({
    APIKEY: settings.apiKey,
    APISECRET: settings.apiSecret
})

const wsURL = 'wss://fstream.binance.com/ws/' + SYMBOL.toLowerCase()

module.exports = {
    lib, wsURL,

    get account () { return account },
    get positions () { return positions },
    get lastPrice () { return lastPrice },
    get lastTrade () { return lastTrade },

    getOpenOrders, cancelOrder,
    getPosition, closePosition,
    getAccount,

    streamLastTrade, streamUserData, streamBidAsk, streamBook
}

var account = {}
var positions = []
var openOrders = []
var lastTrade = {}
var lastPrice

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   GET
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function getAccount() {
    lib.futuresAccount()
        .then(response => {
            account = response
            events.emit('api.balancesUpdate', account)
        })
        .catch(err => {
            if (err.code == 'ETIMEDOUT')
                console.warn('Warning: getAccount() request timed out')
        })
}

function getOpenOrders () {
    lib.futuresOpenOrders(SYMBOL)
        .then(response => {
            openOrders = response.map(o => { return {
                    id: o.orderId,
                    clientID: o.clientOrderId,
                    filledQty: o.executedQty,
                    price: o.price,
                    value: o.price, // synonym, for feeding to techan.substance
                    qty: o.origQty,
                    reduceOnly: o.reduceOnly,
                    side: o.side.toLowerCase(),
                    status: o.status,
                    stopPrice: o.stopPrice,
                    symbol: o.symbol,
                    time: o.time,
                    timeInForce: o.timeInForce,
                    type: o.type,
                    updateTime: o.updateTime
            } })
            events.emit('api.orderUpdate', openOrders)
        })
        .catch(err => console.error(err))
}

function getPosition () {
    lib.futuresPositionRisk()
        .then(response => {
            var p = response[SYMBOL]
            positions[0] = {
                leverage: p.leverage,
                liquidation: p.liquidationPrice,
                margin: p.isolatedMargin,
                marginType: p.marginType,
                price: p.entryPrice,
                value: p.entryPrice, // synonym, for feeding to techan.substance
                qty: p.positionAmt,
                side: (p.positionAmt >= 0) ? 'long' : 'short',
                symbol: p.symbol
            }
            events.emit('api.positionUpdate', positions)
        })
        .catch(err => console.error(err))
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   PUT
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function cancelOrder (id) {
    lib.futuresCancel(SYMBOL, {orderId: id})
        // .then(r => console.log(r))
        .catch(err => console.error(err))
}

function closePosition () {
    var qty = positions[0].qty

    if (qty < 0)
        lib.futuresMarketBuy(SYMBOL, -qty, {'reduceOnly': true})
            .catch(error => console.error(error))
    else if (qty > 0)
        lib.futuresMarketSell(SYMBOL, qty, {'reduceOnly': true})
            .catch(error => console.error(error))
}

// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
//   STREAM (WEBSOCKET)
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
function streamBook () {
    var stream = new WebSocket(wsURL + '@depth@0ms')

    stream.onmessage = (e) => {
        var book = JSON.parse(e.data)
        events.emit('api.bookUpdate', book)
    }
}

function streamBidAsk () {
    var stream = new WebSocket(wsURL + '@bookTicker')

    stream.onmessage = (e) => {
        var bidAsk = JSON.parse(e.data)
        events.emit('api.bidAskUpdate', bidAsk)
    }
}

function streamLastTrade () {
    /* Last aggregated taker trade. Gives price, refreshed 100ms */
    var stream = new WebSocket(wsURL + '@aggTrade')

    stream.onmessage = (e) => {
        lastTrade = JSON.parse(e.data)
        lastPrice = lastTrade.p
        events.emit('api.priceUpdate', lastPrice)
        events.emit('api.newTrade', lastTrade)
    }
}

function streamUserData () {
    var stream

    // Get key
    lib.futuresGetDataStream()
        .then(response => openStream(response))
        .catch(err => console.error(err))

    function openStream (key) {
        stream = new WebSocket('wss://fstream.binance.com/ws/' + key.listenKey)

        // Get what happened before the stream opened
        stream.onopen = () => {
            getOpenOrders()
            getPosition()
        }

        stream.onmessage = (e) => {
            var data = JSON.parse(e.data)

            if (data.e == 'ORDER_TRADE_UPDATE')
                orderUpdate(data)
            if (data.e == 'ACCOUNT_UPDATE') {
                positionUpdate(data)
                balancesUpdate(data)
            }
        }

        // Ping every 10 min to keep stream alive
        setInterval(() => {
                lib.futuresGetDataStream()
                    .catch(e => console.error(e))
            }, 20 * 60000
        )
        stream.onclose = streamUserData
    }

    function balancesUpdate (data) {
        if (account.totalWalletBalance != data.a.B[0].wb)
            getAccount()
    }

    function positionUpdate (data) {
        var p = data.a.P.filter(x => x.s == SYMBOL)[0]

        if (!positions[0]) positions[0] = {}
        Object.assign(positions[0], {
            margin: p.iw,
            marginType: p.mt,
            price: p.ep,
            value: p.ep, // synonym, for feeding to techan.substance
            qty: p.pa,
            side: (p.pa >= 0) ? 'long' : 'short',
            symbol: p.s
        })
        getPosition() // REST update for missing data

        events.emit('api.positionUpdate', positions)
    }

    function orderUpdate(data) {
        var o = data.o
        var order = {
            id: o.i,
            clientID: o.c,
            filledQty: o.z,
            price: o.p,
            value: o.p, // synonym, for feeding to techan.supstance
            qty: o.q,
            reduceOnly: o.R,
            side: o.S.toLowerCase(),
            status: o.X,
            stopPrice: o.sp,
            symbol: o.s,
            time: o.T,
            timeInForce: o.f,
            type: o.o,
            updateTime: data.E
        }
        // New limit order
        if (order.status == 'NEW' && order.type == 'LIMIT') {
            openOrders.push(order)
        }
        // Removed limit order
        if (order.type == 'LIMIT'
            && ['CANCELED', 'EXPIRED', 'FILLED'].indexOf(order.status) >= 0)
            {
            var index = openOrders.findIndex(x => x.id == order.id)
            if (typeof index != 'undefined') {
                openOrders.splice(index, 1)

                if(order.status == 'FILLED')
                    new Audio('./audio/plop.mp3').play()
            }
        }
        events.emit('api.orderUpdate', openOrders)
    }
}
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
