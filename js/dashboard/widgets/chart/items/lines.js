'use strict'
const techan = require('techan')
const AxisLabel = require('./axis-label')

module.exports = class Lines {

    constructor (chart) {
        this.chart = chart
        this._getDimensions()

        this.techan = techan.plot.supstance()
                .xScale(this.scales.x)
                .yScale(this.scales.y)
                .annotation([
                    AxisLabel.left(this.axes.yLeft),
                    AxisLabel.right(this.axes.yRight, this.width)
                ])
    }

    appendTo (container, className) {
        this.wrapper = container.append('g')
            .class(className)

        this._clip(container)
        return this
    }

    draw (data) {
        this.wrapper
            .datum(data)
            .call(this.techan)
        return this
    }

    resize () {
        this._getDimensions()
        this.techan
            .xScale(this.scales.x)
            .yScale(this.scales.y)
            .annotation([
                AxisLabel.left(this.axes.yLeft),
                AxisLabel.right(this.axes.yRight, this.width)
            ])
        d3.select('#clipLines rect')
            .attr('x', 0 - this.margin.left)
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height)
    }

    on (event, callback, ...args) {
        this.techan.on(event, callback, ...args)
        return this
    }

    draggable () {
        this.wrapper.call(this.techan.drag)
    }

    _clip (container) {
        this.wrapper.attr('clip-path', 'url(#clipLines)')

        if (!document.getElementById('clipLines'))
            this.clipRect = container.insert('clipPath', ':first-child')
                    .attr('id', 'clipLines')
                .append('rect')
                    .attr('x', 0 - this.margin.left)
                    .attr('y', 0)
                    .attr('width', this.width + this.margin.left + this.margin.right)
                    .attr('height', this.height)
    }

    _getDimensions () {
        this.axes = this.chart.axes
        this.scales = this.chart.scales
        this.width = this.chart.width
        this.height = this.chart.height
        this.margin = this.chart.margin
    }
}
