
const Binance = require('node-binance-api')
const binance = new Binance().options({
        APIKEY: 'v1708vJ5dYaHyPev81r0Mi6Vds5JGa5pR28SUPjbgMhDw0cfAE8t6Q6ZLXQAzqiS',
        APISECRET: 'oOEvPnMqmN2HAPdJjIBKVFKr4eZR1vb0inGsefDL2hzJNqqSk1GT6IQTimo1J1xj'
    })

// Callbacks
var onOrderUpdate = []
var onPositionUpdate = []

var openOrders = []
var positions = []

module.exports = { binance, cancelOrder, onOrderUpdate, onPositionUpdate, getOpenOrders, getPosition }

streamUserData()

//// GET DATA (REST)
function cancelOrder (id) {
    binance.futuresCancel('BTCUSDT', {orderId: id})
        //.then(r => console.log(r))
        .catch(err => console.error(err))
}

function getOpenOrders () {
    binance.futuresOpenOrders('BTCUSDT')
        .then(response => {
            openOrders = response.map(o => { return {
                    id: o.orderId,
                    clientID: o.clientOrderId,
                    filledQty: o.executedQty,
                    market: o.symbol,
                    price: o.price,
                    value: o.price, // synonym, for feeding to techan.substance
                    qty: o.origQty,
                    reduceOnly: o.reduceOnly,
                    side: o.side,
                    status: o.status,
                    stopPrice: o.stopPrice,
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
            p = response.BTCUSDT // Restrict to BTC for now
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

//// STREAM USER TRADES & POSITION CHANGES (WEBSOCKET)
function streamUserData () {
    var stream

    // Get key
    binance.futuresGetDataStream()
        .then(response => openStream(response))
        .catch(err => console.error(err))

    function openStream (key) {
        stream = new WebSocket('wss://fstream.binance.com/ws/' + key.listenKey)

        stream.onmessage = (event) => {
            data = JSON.parse(event.data)

            // Order update
            if (data.e == 'ORDER_TRADE_UPDATE')
                orderUpdate(data)

            // Account or position update
            if (data.e == 'ACCOUNT_UPDATE') {
                positionUpdate(data)
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

    function positionUpdate (data) {
        p = data.a.P[0]
        position = {
            leverage: NaN,
            liquidation: NaN,
            margin: p.iw,
            marginType: p.mt,
            price: p.ep,
            value: p.ep, // synonym, for feeding to techan.substance
            qty: p.pa,
            side: (p.pa >= 0) ? 'long' : 'short',
            symbol: p.s
        }
        if (position.qty != 0) positions = [position]
        else positions = []

        for (let func of onPositionUpdate) func(positions)
    }

    function orderUpdate(data) {
        o = data.o
        order = {
            id: o.i,
            clientID: o.c,
            filledQty: o.z,
            market: o.s,
            price: o.p,
            value: o.p, // synonym, for feeding to techan.supstance
            qty: o.q,
            reduceOnly: o.R,
            side: o.S,
            status: o.X,
            stopPrice: o.sp,
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
            index = openOrders.findIndex(x => x.id == order.id)
            if (typeof index != 'undefined') {
                openOrders.splice(index, 1)
            }
        }
        for (let func of onOrderUpdate) func(openOrders)
    }
}
////
