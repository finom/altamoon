'use strict'
const techan = require('techan')
const AxisLabel = require('./axis-label')

module.exports = class Crosshair {

    wrapper

    constructor (xScale, yScale, xAxis, yAxisLeft, yAxisRight, width, height) {
        this.xScale = xScale
        this.yScale = yScale
        this.xAxis = xAxis
        this.yAxisLeft = yAxisLeft
        this.yAxisRight = yAxisRight
        this.width = width
        this.height = height
    }

    appendWrapper (container) {
        this.wrapper = container.append('g')
            .class('crosshair')
    }

    draw () {
        this.wrapper.call(techan.plot.crosshair()
            .xScale(this.xScale)
            .yScale(this.yScale)
            .xAnnotation(AxisLabel.bottom(this.xAxis, this.height))
            .yAnnotation([
                AxisLabel.left(this.yAxisLeft),
                AxisLabel.right(this.yAxisRight, this.width)
            ])
        )
    }
}
