'use strict'
const heikinashi = require('./heikin-ashi')

class Plot {
    constructor (container, xScale, yScale) {
        this.container = container
        this.xScale = xScale
        this.yScale = yScale
        this.wrapper = this.appendWrapper()

        this.candles
        this.haCandles // 'ha' for 'Heikin Ashi'
    }

    appendWrapper () {
        return this.container.append('g')
            .attr('class', 'plot')
            .attr('clip-path', 'url(#clip)')
    }

    draw (candles) {
        this.candles = candles
        this.haCandles = heikinashi(candles)

        let data = this.candles
        // let data = this.haCandles

        this.wrapper
            .selectAll('g')
            .data(data)
            .join(
                enter => enter.append('g')
                    .attr('class', 'candle')
                    .attr('transform',
                        d => 'translate(' + this.xScale(d.date) + ' 0)')
                    .call(g => this._appendBody(g))
                    .call(g => this._appendWick(g))
                ,
                update => update
                    .attr('transform',
                        d => 'translate(' + this.xScale(d.date) + ' 0)')
                    .call(g => this._updateBody(g))
                    .call(g => this._updateWick(g))
            )
    }

    _appendBody (g) {
        g.append('line')
            .call(line => this._bodyAttributes(line))
    }

    _appendWick (g) {
        g.append('line')
            .call(line => this._wickAttributes(line))
    }

    _updateBody (g) {
        g.select('line')
            .call(line => this._bodyAttributes(line))
    }

    _updateWick (g) {
        g.select('line:last-child')
            .call(line => this._wickAttributes(line))
    }

    _bodyAttributes (line) {
        line.attr('class', (d, i) => 'body ' + this._candleDirection(i))
            .attr('y1', d => this.yScale(d.open))
            .attr('y2', d => this.yScale(d.close))
            .attr('stroke-width', d =>
                Math.max(3, this.zoomScale * 1.5)
            )
    }

    _wickAttributes (line) {
        line.attr('class', (d, i) => 'wick ' + this._candleDirection(i))
            .attr('y1', d => this.yScale(d.low))
            .attr('y2', d => this.yScale(d.high))
    }

    _candleDirection (i) {
        let { open, close } = this.haCandles[i]
        return open <= close ? 'up' : 'down'
    }

    get zoomScale () {
        return d3.zoomTransform(this.wrapper.node()).k
    }
}

module.exports = { Plot }
