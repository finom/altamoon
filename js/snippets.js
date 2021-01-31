/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'

module.exports = { parseInputNumber, truncateDecimals }

function parseInputNumber () {
    let string = event.target.value

    let regex = /[0-9]|\./
    for (let i = 0; i < string.length; i++) {
        if (!regex.test(string[i])) {
            string = string.replace(string[i], '')
            i--
        }
    }
    return event.target.value = string
}

function truncateDecimals (number, digits) {
    var multiplier = Math.pow(10, digits),
        adjustedNum = number * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum)

    return truncatedNum / multiplier
}
