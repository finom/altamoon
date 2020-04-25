'use strict'

module.exports = class Axes {

    constructor (scales, width, height) {
        this.scales = scales
        this.width = width
        this.height = height

        this.x = d3.axisBottom(scales.x)

        this.yLeft = d3.axisLeft(scales.y)
                .tickFormat(d3.format('.2f'))

        this.yRight = d3.axisRight(scales.y)
                .tickFormat(d3.format('.2f'))
    }

    appendTo (container) {
        this.gX = container.append('g').class('x axis bottom')
                .attr('transform', 'translate(0,' + this.height + ')')

        this.gYLeft = container.append('g').class('y axis left')
        this.gYRight = container.append('g').class('y axis right')
                .attr('transform', 'translate(' + this.width + ',0)')
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
}
