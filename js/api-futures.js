'use strict'
const Binance = require('node-binance-api')
const binance = new Binance().options({
    APIKEY: 'nBZIPvnJXxAnbswpRmvNeqlOIwAouIg6oWGUt9t5J2uiIry8BzyueKx4BycjvSWc',
    APISECRET: 'qQ7xAC36EDqSc3ZTnckjn2gsiSiF9aVucywCN0mg3SzkmeRk7Gnu8Fon6tgzVrhq'
})

module.exports = {
    binance,

    get onOrderUpdate () { return onOrderUpdate },
    get onPositionUpdate () { return onPositionUpdate },
    get onBalancesUpdate () { return onBalancesUpdate },
    get onPriceUpdate () { return onPriceUpdate },
    get onBidAskUpdate () { return onBidAskUpdate },

    get account () { return account },
    get positions () { return positions },
    get openOrders () { return openOrders },
    get lastTrade () { return lastTrade },
    get lastPrice () { return lastPrice },
    get bidAsk () { return bidAsk },

    getOpenOrders, cancelOrder,
    getPosition, closePosition,
    getAccount,

    streamLastTrade, streamUserData, streamBidAsk
}

// Callbacks
var onOrderUpdate = []
var onPositionUpdate = []
var onBalancesUpdate = []
var onPriceUpdate = []
var onBidAskUpdate = []

var account = {}
var positions = []
var openOrders = []
var lastTrade = {}
var lastPrice
var bidAsk

//// GET
function getAccount() {
    binance.futuresAccount()
        .then(response => {
            account = response
            for (let func of onBalancesUpdate) func(account)
        })
}

function getOpenOrders () {
    binance.futuresOpenOrders('BTCUSDT')
        .then(response => {
            openOrders = response.map(o => { return {
                    id: o.orderId,
                    clientID: o.clientOrderId,
                    filledQty: o.executedQty,
                    price: o.price,
                    value: o.price, // synonym, for feeding to techan.substance
                    qty: o.origQty,
                    reduceOnly: o.reduceOnly,
                    side: o.side,
                    status: o.status,
                    stopPrice: o.stopPrice,
                    symbol: o.symbol,
                    time: o.time,
                    type: o.type,
                    updateTime: o.updateTime
            } })
            for (let func of onOrderUpdate) func(openOrders)
        })
        .catch(err => console.error(err))
}

function getPosition () {
    binance.futuresPositionRisk()
        .then(response => {
            var p = response.BTCUSDT // Restrict to BTC for now
            if (p.positionAmt != 0)
                positions = [{
                    leverage: p.leverage,
                    liquidation: p.liquidationPrice,
                    margin: p.isolatedMargin,
                    marginType: p.marginType,
                    price: p.entryPrice,
                    value: p.entryPrice, // synonym, for feeding to techan.substance
                    qty: p.positionAmt,
                    side: (p.positionAmt >= 0) ? 'long' : 'short',
                    symbol: p.symbol
                }]
            else positions = []
            for (let func of onPositionUpdate) func(positions)
        })
        .catch(err => console.error(err))
}

//// PUT
function cancelOrder (id) {
    binance.futuresCancel('BTCUSDT', {orderId: id})
        // .then(r => console.log(r))
        .catch(err => console.error(err))
}

function closePosition () {
    var qty = positions[0].qty

    if (qty < 0)
        binance.futuresMarketBuy('BTCUSDT', -qty, {'reduceOnly': true})
            .catch(error => console.error(error))
    else if (qty > 0)
        binance.futuresMarketSell('BTCUSDT', qty, {'reduceOnly': true})
            .catch(error => console.error(error))
}

//// STREAM (WEBSOCKET)

function streamOrderBook () {
    var book = binance.futuresDepth('BTCUSDT')
        .then(r => OUT(r))

    var bookUpdates = new WebSocket('wss://fstream.binance.com/ws/btcusdt@depth@500ms')
    bookUpdates.onmessage = (e) => OUT(JSON.parse(e.data))
}

function streamBidAsk () {
    var stream = new WebSocket('wss://fstream.binance.com/ws/btcusdt@bookTicker')

    stream.onmessage = (event) => {
        bidAsk = JSON.parse(event.data)
        for (let func of onBidAskUpdate) func(bidAsk)
    }
}

function streamLastTrade () {
    /* Last aggregated taker trade. Gives price, refreshed 100ms */
    var stream = new WebSocket('wss://fstream.binance.com/ws/btcusdt@aggTrade')

    stream.onmessage = (event) => {
        lastTrade = JSON.parse(event.data)
        lastPrice = lastTrade.p
        for (let func of onPriceUpdate) func(lastPrice)
    }
}

function streamUserData () {
    var stream

    // Get key
    binance.futuresGetDataStream()
        .then(response => openStream(response))
        .catch(err => console.error(err))

    function openStream (key) {
        stream = new WebSocket('wss://fstream.binance.com/ws/' + key.listenKey)

        stream.onmessage = (event) => {
            var data = JSON.parse(event.data)

            if (data.e == 'ORDER_TRADE_UPDATE')
                orderUpdate(data)
            if (data.e == 'ACCOUNT_UPDATE') {
                positionUpdate(data)
                balancesUpdate(data)
            }
        }

        // Ping every 10 min to keep stream alive
        setInterval(() => {
                binance.futuresGetDataStream()
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
        var p = data.a.P.filter(x => x.s == symbol)[0] // Restrict to BTC

        if (p.pa != 0) {
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
        }
        else positions = []
        for (let func of onPositionUpdate) func(positions)
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
            side: o.S,
            status: o.X,
            stopPrice: o.sp,
            symbol: o.s,
            time: o.T,
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
            }
        }
        for (let func of onOrderUpdate) func(openOrders)
    }
}
////




























//
