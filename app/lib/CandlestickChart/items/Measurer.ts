/*

'use strict'
const api = require('../../../../apis/futures')
const trading = require('../../trading')

module.exports = class Measurer {

    constructor (chart) {
        this.chart = chart
        this.scales = chart.scales
        this.drawing = false
    }

    appendTo (container, className) {
        this.wrapper = container.append('g')
                .class(className)
                .attr('clip-path', 'url(#clipChart)')
                .attr('display', 'none')
        this.rect = this.wrapper.append('rect')

        this.labelContainer = this.wrapper.append('foreignObject')
        this.labelWrapper = this.labelContainer.append('xhtml:div')
                .class('measurer-label')
        this.label = this.labelWrapper.append('xhtml:div')
    }

    draw (coords) {
        this.wrapper.attr('display', 'visible')

        // Store chart-space coords for start and end points
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

        // Get pixel coords for start and end points
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

    _drawLabel (x, y, rectWidth) {
        this.label.html(this._getLabelText())

        let yDirection = (this.end.y >= this.start.y) ? 1 : 0
        let { width, height } = this.label.node().getBoundingClientRect()
        let margin = 8

        // x
        if (x + width > this.chart.width) // Keep within svg bounds
            x = this.chart.width - width

        // y
        if (yDirection) {
            y = y - height - margin
            if (y < 0) y = 0 // Keep within svg bounds
        }
        else {
            y = y + margin
            if (y + height > this.chart.height) // Same
                y = this.chart.height - height
        }

        // Go place it
        this.labelContainer
                .attr('x', x)
                .attr('y', y)

        this.labelWrapper
            .style('width', rectWidth + 'px')
    }

    _getLabelText () {
        let x1 = this.start.x
        let y1 = this.start.y
        let x2 = this.end.x
        let y2 = this.end.y

        let time = this._getTimeInterval(Math.abs(x2 - x1))

        let amount = y2 - y1

        let percentage = (y2 - y1) / y1

        let leverage = api.position.leverage || 1
        let leveragedPercent = (y2 - y1) / y1 * leverage

        let trueLeverage = api.position.baseValue / api.account.balance
        let trueLeveragedPercent = (y2 - y1) / y1 * trueLeverage

        let side = (y2 >= y1) ? 'buy' : 'sell'
        let orderQty = (y2 >= y1)
                ? trading.order.buyQty
                : trading.order.sellQty
        let orderValue = orderQty.value() * y1
        let orderLeverage = orderValue / api.account.balance
        let orderLeveragedPercent = (y2 - y1) / y1 * orderLeverage

        // Formatting
        amount = nFormat(',.2f', amount)
        percentage = nFormat('+,.2%', percentage)
        leveragedPercent = nFormat('+,.1%', leveragedPercent)

        trueLeveragedPercent = nFormat('+,.1%', trueLeveragedPercent)
        trueLeverage = this._formatLeverage(trueLeverage)

        orderLeveragedPercent = nFormat('+,.1%', orderLeveragedPercent)
        orderLeverage = this._formatLeverage(orderLeverage)

        return `<b>${time}</b><br>`
            + `<b>${amount}</b> USDT<br>`
            + `<b>${percentage}</b><br>`
            + `<b>${leveragedPercent}</b> at ${leverage}x<br>`
            + `<b>${trueLeveragedPercent}</b> at ${trueLeverage}x (position)<br>`
            + `<b>${orderLeveragedPercent}</b> at ${orderLeverage}x (${side} qty)`
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

    _formatLeverage (leverage) {
        return (leverage < 10)
                ? nFormat('.1~f', leverage)
                : nFormat('d', leverage)
    }
}

*/
