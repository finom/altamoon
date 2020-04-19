'use strict'
const smoozCandles = require('./smooz-candles')

class Plot {
    constructor (xScale, yScale) {
        this.xScale = xScale
        this.yScale = yScale

        this.mainWrapper

        this.candles
        this.smoozCandles
    }

    appendWrapper (container) {
        this.mainWrapper = container.append('g')
            .attr('class', 'plot')
            .attr('clip-path', 'url(#clip)')

        return this.mainWrapper
    }

    draw (candles) {
        this.candles = candles
        this.smoozCandles = smoozCandles(candles)

        candles = this.smoozCandles

        this.mainWrapper.selectAll('g')
            .data(candles)
            .join(
                enter =>  enter.append('g')
                    .call(sel => this._appendCandle(sel)),
                update => update
                    .call(sel => this._updateCandle(sel))
            )
    }

    updateLast (candle) {
        this.candles.last = candle

        this.mainWrapper.selectAll('g')
            .data(this.candles)

        let selection = this.mainWrapper.select('g:last-child')
        this._updateCandle(selection)
    }

    _appendCandle (selection) {
        selection
            .attr('class', (d, i) => 'candle ' + this._direction(i))
            .attr('transform',
                d => 'translate(' + this.xScale(d.date) + ' 0)')
            .call(sel => this._appendWick(sel))
            .call(sel => this._appendBody(sel))
    }

    _updateCandle (selection) {
        selection
            .attr('class', (d, i) => 'candle ' + this._direction(i))
            .attr('transform',
                d => 'translate(' + this.xScale(d.date) + ' 0)')
            .call(sel => this._updateWick(sel))
            .call(sel => this._updateBody(sel))
    }

    _direction (i) {
        return this.smoozCandles[i].direction
    }

    _appendBody (g) {
        g.append('rect')
            .call(sel => this._bodyAttributes(sel))
    }

    _appendWick (g) {
        g.append('line')
            .call(sel => this._wickAttributes(sel))
    }

    _updateBody (g) {
        g.select('rect')
            .call(sel => this._bodyAttributes(sel))
    }

    _updateWick (g) {
        g.select('line')
            .call(sel => this._wickAttributes(sel))
    }

    _bodyAttributes (rect) {
        let width = this.zoomScale

        // Clamp width on high zoom out levels
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
        return d3.zoomTransform(this.mainWrapper.node()).k
    }
}

module.exports = Plot
