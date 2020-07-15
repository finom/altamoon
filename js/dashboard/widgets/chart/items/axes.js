'use strict'

module.exports = class Axes {

    constructor (chart) {
        this.chart = chart
        this._getDimensions()

        this.x = d3.axisBottom(this.scales.x)

        let tickFormat = d3.format('.' + chart.yPrecision + 'f')

        this.yLeft = d3.axisLeft(this.scales.y)
                .tickFormat(tickFormat)

        this.yRight = d3.axisRight(this.scales.y)
                .tickFormat(tickFormat)
    }

    appendTo (container) {
        this.gX = container.append('g').class('x axis bottom')

        this.gYLeft = container.append('g').class('y axis left')
        this.gYRight = container.append('g').class('y axis right')

        this._resizeContainers()
    }

    draw () {
        this.gX.call(this.x)
        this.gYLeft.call(this.yLeft
            .tickValues(d3.scaleLinear().domain(this.scales.y.domain()).ticks())
        )
        this.gYRight.call(this.yRight
            .tickValues(d3.scaleLinear().domain(this.scales.y.domain()).ticks())
        )
    }

    resize () {
        this._getDimensions()
        this.x.scale(this.scales.x)
        this.yLeft.scale(this.scales.y)
        this.yRight.scale(this.scales.y)
        this._resizeContainers()
    }

    _resizeContainers () {
        this.gX.attr('transform', 'translate(0,' + this.height + ')')
        this.gYRight.attr('transform', 'translate(' + this.width + ',0)')
    }

    _getDimensions () {
        this.scales = this.chart.scales
        this.width = this.chart.width
        this.height = this.chart.height
    }
}
