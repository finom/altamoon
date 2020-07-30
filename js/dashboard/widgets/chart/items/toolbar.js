'use strict'
const api = require('../../../../apis/futures')
const { config } = require('../../../../config')

module.exports = class Toolbar {

    constructor (chart) {
        this.chart = chart
        this.div = chart.container.append('div')
                .class('toolbar')

        this._addIntervalSelector()
    }

    _addIntervalSelector () {
        let intervals = ['1m','3m','5m', '15m','30m','1h', '2h','4h','6h', '12h','1d']

        let savedValue = config.get('chart.interval')

        this.interval = this.div.append('div')
            .class('interval')

        this.interval.selectAll('span')
            .data(intervals)
            .join(enter => {
                    let span = enter.append('span')

                    span.append('input')
                        .attr('type', 'radio')
                        .attr('name', 'interval')
                        .property('checked', d => d === savedValue)
                        .id(d => 'interval-' + d)

                    span.append('label')
                        .attr('for', d => 'interval-' + d)
                        .html(d => d)
                        .on('click', d => this.chart.changeInterval(d))
                }
            )
    }
}
