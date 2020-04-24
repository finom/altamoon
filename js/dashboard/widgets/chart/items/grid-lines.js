'use strict'

module.exports = class GridLines {

    constructor (scales, width, height) {
        this.width = width
        this.height = height

        this.x = d3.axisTop(scales.x)
                .tickFormat('')
                .tickSize(-this.height)

        this.y = (g) => g.call(d3.axisLeft(scales.y)
                .tickFormat('')
                .tickSize(-this.width)
                .tickValues(d3.scaleLinear().domain(scales.y.domain()).ticks())
            )
    }

    appendWrapper (container) {
        this.xWrapper = container.append('g').class('x gridlines')
        this.yWrapper = container.append('g').class('y gridlines')
    }

    draw() {
        this.xWrapper.call(this.x)
        this.yWrapper.call(this.y)
    }
}
