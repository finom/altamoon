'use strict'
const api = require('../../../../apis/futures')

class LineLabel {

    wrapper

    constructor (chartWidth, yScale) {
        this.chartWidth = chartWidth
        this.yScale = yScale
    }

    appendWrapper (container, className) {
        this.wrapper = container.append('g')
            .class(className)
            .attr('clip-path', 'url(#clip)')
    }

    draw (data) {
        this.wrapper.selectAll('g')
            .data(data)
            .join(
                // Add label at y = price
                enter => enter.append('g').call(g => {
                    let rect = g.append('rect')
                        .attr('x', this.chartWidth - 80)
                        .attr('y', d => this.yScale(d.value) - 10)

                    g.append('text')
                        .text(d => +d.qty)
                        .attr('x', this.chartWidth - 75)
                        .attr('y', d => this.yScale(d.value) + 3)

                    g.attr('data-side', d => d.side)

                    this._addOnClick(rect)
                }),
                // Update y
                update => update.call(g => {
                    let rect = g.select('rect')
                        .attr('y', d => this.yScale(d.value) - 10)
                    g.select('text')
                        .attr('y', d => this.yScale(d.value) + 3)
                        .text(d => +d.qty)
                    g.attr('data-side', d => d.side)

                    this._updateOnClick(rect)
                })
            )
    }

    _addOnClick (rect) { return }

    _updateOnClick (rect) { return }


}

class OrderLabel extends LineLabel {

    constructor (chartWidth, yScale) {
        super(chartWidth, yScale)
    }

    _addOnClick (rect) {
        rect.on('click', d => api.cancelOrder(d.id))
    }
}

class DraftLabel extends LineLabel {

    constructor (chartWidth, yScale, draftToOrder) {
        super(chartWidth, yScale)
        this.draftToOrder = draftToOrder
    }

    _addOnClick (rect) {
        rect.on('click', (d, i) => this.draftToOrder(d, i))
    }

    _updateOnClick (rect) {
        this._addOnClick(rect)
    }
}

module.exports = { LineLabel, OrderLabel, DraftLabel}
