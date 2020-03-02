
const Binance = require('node-binance-api')
const binance = new Binance().options({
        APIKEY: 'v1708vJ5dYaHyPev81r0Mi6Vds5JGa5pR28SUPjbgMhDw0cfAE8t6Q6ZLXQAzqiS',
        APISECRET: 'oOEvPnMqmN2HAPdJjIBKVFKr4eZR1vb0inGsefDL2hzJNqqSk1GT6IQTimo1J1xj'
    })

// Callbacks
var onGetOpenOrders = []
var onGetPosition = []
var onNewUserData = []

module.exports = { binance, onGetOpenOrders, onGetPosition, onNewUserData,
    cancelOrder, getOpenOrders, getPosition }

streamUserData()


function cancelOrder (id) {
    binance.futuresCancel('BTCUSDT', {orderId: id})
        //.then(r => console.log(r))
        .catch(e => console.error(e))
}

function getOpenOrders () {
    binance.futuresOpenOrders('BTCUSDT')
        .then(r => {
            for (let func of onGetOpenOrders) func(r)
        })
        .catch(e => console.error(e))
}

function getPosition () {
    binance.futuresPositionRisk()
        .then(response => {
            for (let func of onGetPosition) func(response)
        })
        .catch(error => console.error(error))
}

//// STREAM USER TRADES & POSITION
function streamUserData () {
    var stream

    // Get key
    binance.futuresGetDataStream()
        .then(response => openStream(response))
        .catch(error => console.error(error))

    function openStream (key) {
        stream = new WebSocket('wss://fstream.binance.com/ws/' + key.listenKey)

        // Run callbacks with fresh data
        stream.onmessage = (event) => {
            data = JSON.parse(event.data)
            for (let func of onNewUserData) func(data)
            // OUT('Stream update: ' + data.e)
        }

        // Ping stream every 10 min
        setInterval(
            () => {
                binance.futuresGetDataStream()
                    .then(r => console.log('key: ' + r.listenKey))
                    .catch(e => console.error(e))
            },
            20 * 60000
        )

        stream.onclose = streamUserData
    }
}
////
