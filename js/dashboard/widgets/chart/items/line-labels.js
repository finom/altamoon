/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'
const api = require('../../../../apis/futures')

module.exports = class LineLabels {

    wrapper
    eventListeners = {}

    constructor (chart) {
        this.chart = chart
    }

    appendTo (container, className) {
        this.wrapper = container.append('g')
            .class(className)
            .attr('clip-path', 'url(#clipChart)')
    }

    draw (data) {
        this._getDimensions()

        this.wrapper.selectAll('g')
            .data(data)
            .join(
                // Add label at y = price
                enter => enter.append('g').call(g => {
                    let foreign = g.append('foreignObject')
                            .attr('x', this.chartWidth - 80)
                            .attr('y', d => this.yScale(d.value) - 10)
                            .style('overflow', 'visible')
                    let wrapper = foreign.append('xhtml:div')
                            .class('line-label')

                    wrapper.append('xhtml:div')
                            .class('name')
                            .html('TEMP')

                    wrapper.append('xhtml:div')
                            .class('qty')
                            .html(d => +d.qty)

                    g.attr('data-side', d => d.side)

                    this._addEventListeners(wrapper)
                }),
                // Update y
                update => update.call(g => {
                    g.select('foreignObject')
                            .attr('x', this.chartWidth - 80)
                            .attr('y', d => this.yScale(d.value) - 10)

                    let wrapper = g.select('.line-label')

                    g.select('qty')
                            .html(d => +d.qty)

                    g.attr('data-side', d => d.side)

                    g.select('text')
                        .text(d => +d.qty)
                        .attr('x', this.chartWidth - 75)
                        .attr('y', d => this.yScale(d.value) + 3)
                    g.attr('data-side', d => d.side)

                    this._addEventListeners(wrapper)
                })
            )
    }

    on (event, callback) {
        this.eventListeners[event] = callback
    }

    _addEventListeners (node) {
        for (let [event, callback] of Object.entries(this.eventListeners))
            node.on(event, callback)
    }

    _getDimensions () {
        this.chartWidth = this.chart.width
        this.yScale = this.chart.scales.y
    }
}
