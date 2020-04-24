'use strict'

module.exports = class ClipPath {

    constructor (width, height, x = 0, y = 0) {
        this.width = width
        this.height = height
        this.x = x
        this.y = y
    }

    append (container, id) {
        container.append('clipPath')
                .attr('id', id)
            .append('rect')
                .attr('x', this.x)
                .attr('y', this.y)
                .attr('width', this.width)
                .attr('height', this.height)
    }
}
