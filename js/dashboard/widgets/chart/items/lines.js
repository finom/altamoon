'use strict'
const techan = require('techan')
const AxisLabel = require('./axis-label')

module.exports = class Lines {

    constructor (scales, axes, width, height, margin) {
        this.axes = axes
        this.width = width
        this.height = height
        this.margin = margin

        this.techan = techan.plot.supstance()
                .xScale(scales.x)
                .yScale(scales.y)
                .annotation([
                    AxisLabel.left(this.axes.yLeft),
                    AxisLabel.right(this.axes.yRight, this.width)
                ])
    }

    appendWrapper (container, className) {
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
            container.insert('clipPath', ':first-child')
                    .attr('id', 'clipLines')
                .append('rect')
                    .attr('x', 0 - this.margin.left)
                    .attr('y', 0)
                    .attr('width', this.width + this.margin.left + this.margin.right)
                    .attr('height', this.height)
    }
}
