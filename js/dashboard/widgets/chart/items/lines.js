'use strict'
const techan = require('techan')
const AxisLabel = require('./axis-label')

module.exports = class Lines {

    constructor (xScale, yScale, yAxisLeft, yAxisRight, width) {
        this.xScale = xScale
        this.yScale = yScale
        this.yAxisLeft = yAxisLeft
        this.yAxisRight = yAxisRight
        this.width = width
    }

    appendWrapper (container, className) {
        return this.wrapper = container.append('g')
            .class(className)
    }

    draw (data) {
        this.wrapper
            .datum(data)
            .call(techan.plot.supstance()
                .xScale(this.xScale)
                .yScale(this.yScale)
                .annotation([
                    AxisLabel.left(this.yAxisLeft),
                    AxisLabel.right(this.yAxisRight, this.width)
                ])
            )
        return this.wrapper
    }
}
