'use strict'

module.exports = class ClipPath {

    constructor (chart, x = 0, y = 0) {
        this.chart = chart
        this.x = x
        this.y = y
    }

    appendTo (container, id) {
        this.rect = container.append('clipPath')
                .attr('id', id)
            .append('rect')

        this.resize()
    }

    resize () {
        this._getDimensions()
        this.rect.attr('x', this.x)
                .attr('y', this.y)
                .attr('width', this.width)
                .attr('height', this.height)
    }

    _getDimensions () {
        this.width = this.chart.width
        this.height = this.chart.height
    }
}
