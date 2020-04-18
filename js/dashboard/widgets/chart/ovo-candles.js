'use strict'

module.exports = ovoCandles

/**
 * Returns an array of smoothed candles.
 * (Based on heikin ashi candles)
 * */
function ovoCandles (candles) {
    let newCandles = []

    for (let i = 0; i < candles.length; i++) {
        let { open, close, high, low, date, volume } = candles[i]
        let last = newCandles[i-1]

        let newOpen = (last)
                ? (last.open + last.close) / 2
                : (open + close) / 2
        let newClose = (open + close + high + low) / 4

        let newDirection = (newOpen <= newClose)
            ? 'up' : 'down'

        // Clamp new open to low/high
        newOpen = (newDirection === 'up')
            ? Math.max(newOpen, low)
            : Math.min(newOpen, high)

        newCandles[i] = {
            date: date,
            direction: newDirection,
            open : newOpen,
            close : newClose,
            high : high,
            low : low,
            volume: volume
        }

        // Adjust close of last candle, we don't want gaps
        if (last)
            last.close = (last.direction === 'up')
                ? Math.max(last.close, newOpen)
                : Math.min(last.close, newOpen)
    }
    return newCandles
}
