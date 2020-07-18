'use strict'
const api = require('../../../../apis/futures')


module.exports = class Measurer {

    constructor (chart) {
        this.scales = chart.scales
        this.drawing = false
    }

    appendTo (container, className) {
        this.wrapper = container.append('g')
                .class(className)
                .attr('clip-path', 'url(#clipChart)')
                .attr('display', 'none')
        this.rect = this.wrapper.append('rect')

        this.labelWrapper = this.wrapper.append('foreignObject')
        this.label = this.labelWrapper
            .append('xhtml:div')
                .class('measurer-label')
            .append('xhtml:div')
    }

    draw (coords) {
        this.wrapper.attr('display', 'visible')

        this.end = {
            x: this.scales.scaledX.invert(coords.x),
            y: this.scales.y.invert(coords.y)
        }
        this.start = this.start || this.end

        this.resize()
    }

    hide () {
        this.wrapper.attr('display', 'none')
    }

    get hidden () {
        return (this.wrapper.attr('display') == 'none') ? true : false
    }

    resize () {
        if (this.wrapper.attr('display') === 'none')
            return

        let start = {
            x: this.scales.scaledX(this.start.x),
            y: this.scales.y(this.start.y)
        }
        let end = {
            x: this.scales.scaledX(this.end.x),
            y: this.scales.y(this.end.y)
        }

        let x = Math.min(start.x, end.x)
        let y = Math.min(start.y, end.y)

        let width = Math.abs(end.x - start.x)
        let height = Math.abs(end.y - start.y)

        this._drawRect(x, y, width, height)
        this._drawLabel(x, end.y, width, height)
    }

    _drawRect (x, y, width, height) {
        this.rect
            .attr('x', x)
            .attr('y', y)
            .attr('width', width)
            .attr('height', height)
    }

    _drawLabel (x, y, width) {
        this.label
            .html(this._getLabelText())

        this.labelWrapper
                .attr('x', x)
                .attr('y', y)
                .attr('width', 0)
                .attr('height', 0)


        let transform =
            (this.end.y >= this.start.y) // Positive Y
                ? 'translateY(-100%)' // Move label above rect
                : null

        this.labelWrapper.select('div')
            .style('width', width + 'px')
            .style('transform', transform)
    }

    _getLabelText () {
        let x1 = this.start.x
        let y1 = this.start.y
        let x2 = this.end.x
        let y2 = this.end.y

        let amount = d3.format(',.2f')(y2 - y1)
        let percentage = d3.format('+,.2%')((y2 - y1) / y1)

        let position = api.positions.filter(x => x.symbol == SYMBOL)[0]
        let leverage = position.leverage || 1
        let leveragedPercent = d3.format('+,.1%')((y2 - y1) / y1 * leverage)

        let trueLeverage = position.baseValue / api.account.totalWalletBalance
        let trueLeveragePercent = d3.format('+,.1%')((y2 - y1) / y1 * trueLeverage)
        let formatedTrueLeverage = (trueLeverage < 10)
                ? trueLeverage.toFixed(1)
                : trueLeverage

        let time = this._getTimeInterval(Math.abs(x2 - x1))

        return `<b>${time}</b><br>`
            + `<b>${amount}</b> USDT<br>`
            + `<b>${percentage}</b><br>`
            + `<b>${leveragedPercent}</b> at ${leverage}x<br>`
            + `<b>${trueLeveragePercent}</b> at ${formatedTrueLeverage}x (position)`
    }

    _getTimeInterval (milliseconds) {
        let days, hours, minutes, total_hours, total_minutes, total_seconds

        total_seconds = parseInt(Math.floor(milliseconds / 1000))
        total_minutes = parseInt(Math.floor(total_seconds / 60))
        total_hours = parseInt(Math.floor(total_minutes / 60))
        days = parseInt(Math.floor(total_hours / 24))

        minutes = parseInt(total_minutes % 60)
        hours = parseInt(total_hours % 24)

        return (days ? days + 'd ' : '')
            + (hours ? hours + 'h ' : '')
            + (minutes ? minutes + 'm' : '')
    }
}
