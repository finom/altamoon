'use strict'
const smoozCandles = require('./smooz-candles')

class Plot {
    constructor (container, xScale, yScale) {
        this.container = container
        this.xScale = xScale
        this.yScale = yScale
        this.wrapper = this.appendWrapper()

        this.candles
        this.smoozCandles
    }

    appendWrapper () {
        return this.container.append('g')
            .attr('class', 'plot')
            .attr('clip-path', 'url(#clip)')
    }

    draw (candles) {
        this.candles = candles
        this.smoozCandles = smoozCandles(candles)

        // let data = this.candles
        let data = this.smoozCandles

        this.wrapper
            .selectAll('g')
            .data(data)
            .join(
                enter => enter.append('g')
                    .attr('class', (d, i) => 'candle ' + this._direction(i))
                    .attr('transform',
                        d => 'translate(' + this.xScale(d.date) + ' 0)')
                    .call(g => this._appendWick(g))
                    .call(g => this._appendBody(g))
                ,
                update => update
                    .attr('class', (d, i) => 'candle ' + this._direction(i))
                    .attr('transform', d =>
                        'translate(' + this.xScale(d.date) + ' 0)')
                    .call(g => this._updateWick(g))
                    .call(g => this._updateBody(g))
            )
    }

    _direction (i) {
        return this.smoozCandles[i].direction
    }

    _appendBody (g) {
        g.append('rect')
            .call(rect => this._bodyAttributes(rect))
    }

    _appendWick (g) {
        g.append('line')
            .call(line => this._wickAttributes(line))
    }

    _updateBody (g) {
        g.select('rect')
            .call(rect => this._bodyAttributes(rect))
    }

    _updateWick (g) {
        g.select('line')
            .call(line => this._wickAttributes(line))
    }

    _bodyAttributes (rect) {
        let width = this.zoomScale

             if (width < 0.8) width = 0
        else if (width < 1.5) width = 2
        else if (width < 3.0) width = 3

        rect.attr('class', 'body')
            .attr('x', -width / 2)
            .attr('y', d => Math.min(this.yScale(d.open), this.yScale(d.close)))
            .attr('height', d =>
                Math.abs(this.yScale(d.close) - this.yScale(d.open))
            )
            .attr('width', width)
    }

    _wickAttributes (line) {
        line.attr('class', 'wick')
            .attr('y1', d => this.yScale(d.low))
            .attr('y2', d => this.yScale(d.high))
    }

    get zoomScale () {
        return d3.zoomTransform(this.wrapper.node()).k
    }
}

module.exports = { Plot }
