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
                    let rect = g.append('rect')
                        .attr('x', this.chartWidth - 80)
                        .attr('y', d => this.yScale(d.value) - 10)

                    g.append('text')
                        .text(d => +d.qty)
                        .attr('x', this.chartWidth - 75)
                        .attr('y', d => this.yScale(d.value) + 3)

                    g.attr('data-side', d => d.side)

                    this._addEventListeners(rect)
                }),
                // Update y
                update => update.call(g => {
                    let rect = g.select('rect')
                        .attr('x', this.chartWidth - 80)
                        .attr('y', d => this.yScale(d.value) - 10)
                    g.select('text')
                        .text(d => +d.qty)
                        .attr('x', this.chartWidth - 75)
                        .attr('y', d => this.yScale(d.value) + 3)
                    g.attr('data-side', d => d.side)

                    this._addEventListeners(rect)
                })
            )
    }

    on (event, callback) {
        this.eventListeners[event] = callback
    }

    _addEventListeners (rect) {
        for (let [event, callback] of Object.entries(this.eventListeners))
            rect.on(event, callback)
    }

    _getDimensions () {
        this.chartWidth = this.chart.width
        this.yScale = this.chart.scales.y
    }
}
