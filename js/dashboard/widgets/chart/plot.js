'use strict'

class Plot {
    constructor (container, xScale, yScale) {
        this.container = container
        this.xScale = xScale
        this.yScale = yScale
        this.wrapper = this.appendWrapper()

        this.haCandles // 'ha' for 'Heikin Ashi'
    }

    appendWrapper () {
        return this.container.append('g')
            .attr('class', 'plot')
            .attr('clip-path', 'url(#clip)')
    }

    draw (candles) {
        this._candlesToHeikinashi(candles)
        this.wrapper
            .selectAll('g')
            .data(candles)
            .join(
                enter => enter.append('g')
                    .attr('class', 'candle')
                    .attr('transform',
                        d => 'translate(' + this.xScale(d.date) + ', 0)'
                    )
                    .call(sel => this._appendBody(sel))
                    .call(sel => this._appendWick(sel))
                ,
                update => update
                    .attr('transform',
                        d => 'translate(' + this.xScale(d.date) + ', 0)'
                    )
                    .call(sel => this._updateBody(sel))
                    .call(sel => this._updateWick(sel))
            )
    }

    transformX (transform) {
        let zoom = 'translate(' + transform.x + ',0) '
                    + 'scale(' + transform.k + ',1)'
        this.wrapper.attr('transform', zoom)
    }

    _candlesToHeikinashi(candles) {
        this.haCandles = []
        for (let [i, d] of candles.entries()) {
            let last = this.haCandles[i-1]
            if (last)
                open = (last.open + last.close) / 2
            else
                open = (d.open + d.close) / 2

            close = (d.open + d.close + d.high + d.low) / 4

            this.haCandles[i] = { open: open, close: close }
        }
    }

    _appendBody (g) {
        g.append('line')
            .call(sel => this._bodyAttributes(sel))
    }

    _appendWick (g) {
        g.append('line')
            .call(sel => this._wickAttributes(sel))
    }

    _updateBody (g) {
        g.select('line')
            .call(sel => this._bodyAttributes(sel))
    }

    _updateWick (g) {
        g.select('line:last-child')
            .call(sel => this._wickAttributes(sel))
    }

    _bodyAttributes (line) {
        line.attr('class', (d, i) => 'body ' + this._getDirection(i))
            .attr('y1', d => this.yScale(d.open))
            .attr('y2', d => this.yScale(d.close))
            // .attr('stroke-width', d => this.xScale(???))
    }

    _wickAttributes (line) {
        line.attr('class', (d, i) => 'wick ' + this._getDirection(i))
            .attr('y1', d => this.yScale(d.low))
            .attr('y2', d => this.yScale(d.high))
            // .attr('stroke-width', d => this.xScale(???))
    }

    _getDirection (i) {
        let { open, close } = this.haCandles[i]
        return open <= close ? 'up' : 'down'
    }
}

module.exports = { Plot }
