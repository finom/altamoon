'use strict'
const smoozCandles = require('./smooz-candles')

class Plot {

    constructor (scales) {
        this.xScale = scales.x
        this.yScale = scales.y

        this.candles = []
        this.smoozCandles = []

        this.wrapper

        this.pathBodiesUp
        this.pathBodiesDown
        this.pathWicksUp
        this.pathWicksDown
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   WRAPPER
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    appendTo (container) {
        this.wrapper = container.append('g')
            .class('plot')
            .attr('clip-path', 'url(#clipChart)')

        this.pathBodiesUp = this.wrapper.append('path')
                .class('body up')
        this.pathBodiesDown = this.wrapper.append('path')
                .class('body down')
        this.pathWicksUp = this.wrapper.append('path')
                .class('wick up')
        this.pathWicksDown = this.wrapper.append('path')
                .class('wick down')

        this.lastBody = this.wrapper.append('path')
        this.lastWick = this.wrapper.append('path')

        return this.wrapper
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   DRAW
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    draw (candles, update = false) {
        if (!candles.length)
            return

        if (update || !this.candles.length
                   || candles.last.timestamp != this.candles.last.timestamp) {
            this.candles = [...candles]
            this.smoozCandles = smoozCandles(candles)
        }

        candles = [...this.smoozCandles]
        let lastCandle = candles.pop()

        let upCandles = candles.filter(x => x.direction === 'up')
        let downCandles = candles.filter(x => x.direction === 'down')

        this.pathBodiesUp
            .attr('d', this._getBodies(upCandles, 'up'))
        this.pathWicksUp
            .attr('d', this._getWicks(upCandles, 'up'))
        this.pathBodiesDown
            .attr('d', this._getBodies(downCandles, 'down'))
        this.pathWicksDown
            .attr('d', this._getWicks(downCandles, 'down'))

        this.lastBody
            .attr('d', this._getBodyString(
                lastCandle,
                lastCandle.direction,
                this._bodyWidth
            ))
            .class('body ' + lastCandle.direction)
        this.lastWick
            .attr('d', this._getWickString(lastCandle))
            .class('wick ' + lastCandle.direction)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   UPDATE LAST CANDLE
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    updateLast (candle) {
        let index = this.candles.lastIndex
        this.candles.last = candle

        this.smoozCandles = smoozCandles(
            this.candles,
            this.smoozCandles,
            index
        )

        candle = this.smoozCandles.last

        this.lastBody
            .attr('d', this._getBodyString(
                candle,
                candle.direction,
                this._bodyWidth
            ))
            .class('body ' + candle.direction)
        this.lastWick
            .attr('d', this._getWickString(candle))
            .class('wick ' + candle.direction)
    }

    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    //   INTERNAL METHODS
    // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
    _getBodies (candles, direction) {
        let width = this._bodyWidth
        let string = ''

        for (let candle of candles) {
            string += this._getBodyString(candle, direction, width)
        }
        return string
    }

    _getBodyString(candle, direction, width) {
        let open = Math.round(this.yScale(candle.open))
        let close = Math.round(this.yScale(candle.close))
        let top, bottom

        if (direction === 'up')
            bottom = open,
            top = close
        else
            bottom = close,
            top = open

        let height = top - bottom
        let x = Math.round(this.xScale(candle.date)) - width / 2
        let y = top

        return 'M' + x + ',' + y
            + ' h' + width + 'v' + -height + 'h' + -width + 'z '
    }

    _getWicks (candles) {
        let string = ''

        for (let candle of candles) {
            string += this._getWickString(candle)
        }
        return string
    }

    _getWickString(candle) {
        let x = Math.round(this.xScale(candle.date))
        let y1 = Math.round(this.yScale(candle.high))
        let y2 = Math.round(this.yScale(candle.low))

        return 'M' + x + ',' + y1 + ' v' + (y2 - y1)
    }

    get _bodyWidth () {
        let scale = this._zoomScale

        // Clamp width on high zoom out levels
        let width = (scale < 0.3) ? 1 :
                    (scale < 0.8) ? 1.5 :
                    (scale < 1.5) ? 2 :
                    (scale < 3.0) ? 3 :
                    scale

        return width
    }

    get _zoomScale () {
        return d3.zoomTransform(this.wrapper.node()).k
    }
}

module.exports = Plot
