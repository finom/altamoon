'use strict'
const techan = require('techan')
const AxisLabel = require('./axis-label')

module.exports = class Crosshair {

    wrapper

    constructor (scales, axes, width, height) {
        this.scales = scales
        this.axes = axes
        this.width = width
        this.height = height

        this.techan = techan.plot.crosshair()
                .xScale(this.scales.x)
                .yScale(this.scales.y)
                .xAnnotation(AxisLabel.bottom(this.axes.x, this.height))
                .yAnnotation([
                    AxisLabel.left(this.axes.yLeft),
                    AxisLabel.right(this.axes.yRight, this.width)
                ])
    }

    appendTo (container) {
        this.wrapper = container.append('g')
            .class('crosshair')
    }

    draw () {
        this.wrapper.call(this.techan)
    }
}
