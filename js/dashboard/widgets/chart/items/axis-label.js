'use strict'
const techan = require('techan')

module.exports = class AxisLabel {

    constructor (chart) {
        this.chart = chart
    }

    bottom (xAxis, height) {
        return techan.plot.axisannotation()
        .axis(xAxis)
        .orient('bottom')
        .format(d3.timeFormat('%-d/%-m/%Y %-H:%M:%S'))
        .width(94)
        .translate([0, height])
    }

    left (yAxisLeft) {
        return techan.plot.axisannotation()
            .axis(yAxisLeft)
            .orient('left')
            .format(d3.format(',.' + this.chart.yPrecision + 'f'))
    }

    right (yAxisRight, width) {
        return techan.plot.axisannotation()
            .axis(yAxisRight)
            .orient('right')
            .format(d3.format(',.' + this.chart.yPrecision + 'f'))
            .translate([width, 0])
    }
}
