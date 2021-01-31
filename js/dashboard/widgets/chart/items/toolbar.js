/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'
const {config} = require('../../../../config')
const {remote} = require('electron')

module.exports = class Toolbar {

    constructor (chart) {
        this.chart = chart
        this.div = chart.container.append('div')
                .class('toolbar')

        this.symbolSelect = this.div.append('div')
            .class('symbol')

        this._addSymbolsMenu()
        this._addIntervalSelector()
    }

    _addSymbolsMenu () {
        events.once('api.exchangeInfoUpdate', d => {
            let symbols = []

            for(let x of d.symbols)
                symbols.push({
                    symbol: x.symbol,
                    base: x.baseAsset,
                    quote: x.quoteAsset
                })
            symbols.sort((a, b) => d3.ascending(a.base, b.base))

            this.symbolSelect.append('select')
                .on('change', () => {
                    config.set('symbol', event.target.value)
                    remote.BrowserWindow.getFocusedWindow().reload()
                })
                .selectAll('option')
                    .data(symbols)
                    .enter()
                .append('option')
                    .value(d => d.symbol)
                    .html(d => d.base + ' / ' + d.quote)
                    .property('selected', d => d.symbol === config.get('symbol'))
        })
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
