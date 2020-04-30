'use strict'

module.exports = class Svg {

    constructor (chart) {
        this.chart = chart
    }

    appendTo (selector = '#chart') {
        this.svg = d3.select(selector).append('svg')
        this.graph = this.svg.append('g')
        this.resize()
    }

    resize () {
        let width = this.chart.width
        let height = this.chart.height
        let margin = this.chart.margin

        this.svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
        this.graph
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    }

    append = (...args) => this.graph.append(...args)

    insert = (...args) => this.graph.insert(...args)

    call = (...args) => this.graph.call(...args)

    on = (...args) => this.graph.on(...args)
}
