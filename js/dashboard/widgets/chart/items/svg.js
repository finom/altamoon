'use strict'

module.exports = class Svg {

    constructor (width, height, margin) {
        this.width = width
        this.height = height
        this.margin = margin
    }

    appendTo (selector = '#chart') {
        this.selection = d3.select(selector).append('svg')
                .attr('width', this.width + this.margin.left + this.margin.right)
                .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
    }

    append = (...args) => this.selection.append(...args)

    insert = (...args) => this.selection.insert(...args)

    call = (...args) => this.selection.call(...args)

    on = (...args) => this.selection.on(...args)
}
