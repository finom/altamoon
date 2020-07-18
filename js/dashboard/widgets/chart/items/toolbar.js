'use strict'
const api = require('../../../../apis/futures')

module.exports = class Toolbar {

    constructor (chart) {
        this.chart = chart
        this.div = chart.container.append('div')
                .class('toolbar')

        this._addHtml()
        this._addListeners()
    }

    _addHtml () {
        this.div.html(`
            <select class="interval">
                <option value="1m">1m</option>
                <option value="3m">3m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="30m">30m</option>
                <option value="1h">1h</option>
                <option value="2h">2h</option>
                <option value="4h">4h</option>
                <option value="6h">6h</option>
                <option value="12h">12h</option>
                <option value="1d">1d</option>
                <option value="3d">3d</option>
                <option value="1w">1w</option>
                <option value="1M">1M</option>
            </input>
        `)

        this.interval = this.div.select('.interval')
    }

    _addListeners () {
        this.interval.on('change', () => this._changeInterval(event.target.value))
    }

    _changeInterval (interval) {
        api.terminateStream('kline')
        api.streamLastCandle(interval)
        api.getCandles({interval: interval})
        events.once('api.candlesUpdate', () => {
            this.chart.draw()
            this.chart.svg.call(this.chart.zoom.translateBy, 0)
        })
    }
}
