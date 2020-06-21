'use strict'
const api = require('../../../../apis/futures')


module.exports = class MeasureTool {

    constructor (chart) {
        this.chart = chart
    }

    appendTo (container, className) {
        this.wrapper = container.append('g')
                .class(className)
                .attr('clip-path', 'url(#clipChart)')
        this.rect = this.wrapper.append('rect')

        this.labelWrapper = this.wrapper.append('foreignObject')
        this.label = this.labelWrapper
            .append('xhtml:div')
                .class('measurer-label')
            .append('xhtml:div')
        this.hide()
    }

    draw (coords) {
        this.wrapper.attr('display', 'visible')

        this.start = this.start || coords
        this.coords = coords

        let x = Math.min(this.start.x, coords.x)
        let y = Math.min(this.start.y, coords.y)

        let width = Math.abs(coords.x - this.start.x)
        let height = Math.abs(coords.y - this.start.y)

        this._drawRect(x, y, width, height)
        this._drawLabel(x, y, width, height)
    }

    hide () {
        this.wrapper.attr('display', 'none')
    }

    resize () {
        this.hide()
    }

    _drawRect (x, y, width, height) {
        this.rect
            .attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)
    }

    _drawLabel (x, y, width) {
        this.labelWrapper
                .attr('x', x)
                .attr('y', y)
                .attr('width', 0)
                .attr('height', 0)
        this.labelWrapper.select('div')
            .style('width', width + 'px')
            .style('transform', 'translateY(-100%)')
        this.label
            .html(this._labelText)
    }

    _labelText = () => {
        let x1 = this.chart.plot.xScale.invert(this.start.x)
        let x2 = this.chart.plot.xScale.invert(this.coords.x)
        let y1 = this.chart.scales.y.invert(this.start.y)
        let y2 = this.chart.scales.y.invert(this.coords.y)

        let amount = d3.format(',.2f')(y2 - y1)
        let percentage = d3.format('+,.2%')((y2 - y1) / y1)

        let position = api.positions.filter(x => x.symbol == SYMBOL)[0]
        let leverage = position.leverage
        let leveragedPercent = d3.format('+,.1%')((y2 - y1) / y1 * leverage)

        let time = this._getTimeInterval(Math.abs(x2 - x1))

        return `<b>${time}</b><br>`
            + `<b>${amount}</b> USDT<br>`
            + `<b>${percentage}</b><br>`
            + `<b>${leveragedPercent}</b> at ${leverage}x`
    }

    _getTimeInterval(milliseconds) {
        let days, hours, minutes, seconds, total_hours, total_minutes, total_seconds

        total_seconds = parseInt(Math.floor(milliseconds / 1000))
        total_minutes = parseInt(Math.floor(total_seconds / 60))
        total_hours = parseInt(Math.floor(total_minutes / 60))
        days = parseInt(Math.floor(total_hours / 24))

        seconds = parseInt(total_seconds % 60)
        minutes = parseInt(total_minutes % 60)
        hours = parseInt(total_hours % 24)

        return (days ? days + 'd ' : '')
            + (hours ? hours + 'h ' : '')
            + (minutes ? minutes + 'm' : '')
            // + (seconds ? seconds + 's ' : '')
    }

    // _getDimensions () {
    //     this.width = this.chart.width
    //     this.height = this.chart.height
    // }
}
