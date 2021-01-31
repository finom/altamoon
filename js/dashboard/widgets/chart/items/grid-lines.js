/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'

module.exports = class GridLines {

    constructor (chart) {
        this.chart = chart
        this._getDimensions()

        this.x = d3.axisTop(this.scales.x)
                .tickFormat('')
                .tickSize(-this.height)

        this.y = g => g.call(d3.axisLeft(this.scales.y)
                .tickFormat('')
                .tickSize(-this.width)
                .tickValues(d3.scaleLinear().domain(this.scales.y.domain()).ticks())
            )
    }

    appendTo (container) {
        this.xWrapper = container.append('g').class('x gridlines')
        this.yWrapper = container.append('g').class('y gridlines')
    }

    draw () {
        this.xWrapper.call(this.x)
        this.yWrapper.call(this.y)
    }

    resize () {
        this._getDimensions()
        this.x.tickSize(-this.height)
    }

    _getDimensions () {
        this.scales = this.chart.scales
        this.width = this.chart.width
        this.height = this.chart.height
    }
}
