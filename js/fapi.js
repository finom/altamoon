
const Binance = require('node-binance-api')
const binance = new Binance().options({
        APIKEY: 'nBZIPvnJXxAnbswpRmvNeqlOIwAouIg6oWGUt9t5J2uiIry8BzyueKx4BycjvSWc',
        APISECRET: 'qQ7xAC36EDqSc3ZTnckjn2gsiSiF9aVucywCN0mg3SzkmeRk7Gnu8Fon6tgzVrhq'
    })

// Callbacks
var onOrderUpdate = []
var onPositionUpdate = []
var onBalancesUpdate = []

var openOrders = []
var positions = []
var account = {}

module.exports = { binance, onOrderUpdate, onPositionUpdate, onBalancesUpdate, cancelOrder, getOpenOrders, getPosition, closePosition, getAccount }

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

function closePosition () {
    var qty = positions[0].qty

    if (qty < 0)
        binance.futuresMarketBuy('BTCUSDT', -qty, {'reduceOnly': true})
            .catch(error => console.error(error))
    else if (qty > 0)
        binance.futuresMarketSell('BTCUSDT', qty, {'reduceOnly': true})
            .catch(error => console.error(error))
}

function getAccount() {
    binance.futuresAccount()
        .then(response => {
            account = response

            for (let func of onBalancesUpdate) func(account)
        })
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
        account.totalWalletBalance = data.a.B[0].wb
        for (let func of onBalancesUpdate) func(account)
    }

    function positionUpdate (data) {
        var index = data.a.P.findIndex(x => x.s == 'BTCUSDT') // Restrict to BTC
        var p = data.a.P[index]

        if (p.pa != 0) {
            var position = {
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
            positions = [position]
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
            var index = openOrders.findIndex(x => x.id == order.id)
            if (typeof index != 'undefined') {
                openOrders.splice(index, 1)
            }
        }
        for (let func of onOrderUpdate) func(openOrders)
    }
}
////
