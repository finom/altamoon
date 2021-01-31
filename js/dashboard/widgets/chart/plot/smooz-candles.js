/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'

module.exports = smoozCandles

/**
 * Returns an array of smoothed candles.
 * (Based on heikin ashi candles, but keeps the real high & low)
 * */
function smoozCandles (
    candles,
    prevSmooz = [],     // If updating
    startIndex = 0,     // If updating
) {
    let newCandles = [...prevSmooz.slice(0, startIndex)]

    for (let i = startIndex; i < candles.length; i++) {
        let { open, close, high, low, date, volume } = candles[i]
        let previous = newCandles[i - 1]

        let newOpen = (previous)
            ? (previous.open + previous.close) / 2
            : (open + close) / 2
        let newClose = (open + close + high + low) / 4

        let newDirection = (newOpen <= newClose)
            ? 'up' : 'down'

        // Clamp new open to low/high
        newOpen = (newDirection === 'up')
            ? Math.max(newOpen, low)
            : Math.min(newOpen, high)

        // Keep last candle close as vanilla (to visually keep track of price)
        if (i === candles.length - 1) {
            newClose = close
        }

        newCandles[i] = {
            direction: newDirection,
            date: date,
            open: newOpen,
            close: newClose,
            high: high,
            low: low,
            volume: volume
        }

        // Adjust close/open of previous candle, we don't want gaps
        if (previous)
            if (newDirection === previous.direction)
                previous.close = (previous.direction === 'up')
                    ? Math.max(previous.close, newOpen)
                    : Math.min(previous.close, newOpen)
            else
                previous.open = (previous.direction === 'down')
                    ? Math.max(previous.open, newOpen)
                    : Math.min(previous.open, newOpen)
    }
    return newCandles
}
