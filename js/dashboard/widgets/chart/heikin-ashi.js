'use strict'

/**
 * Returns an array of Heikin Ashi-fied candles.
 * */
function heikinashi (candles) {
    let haCandles = [...candles]

    for (let [i, d] of candles.entries()) {
        let last = haCandles[i-1]

        haCandles[i] = {
            open : (last) ? (last.open + last.close) / 2
                            : (d.open + d.close) / 2,
            close : (d.open + d.close + d.high + d.low) / 4,
            high : Math.max(d.high, open, close),
            low : Math.min(d.low, open, close)
        }
    }
    return haCandles
}

module.exports = heikinashi
