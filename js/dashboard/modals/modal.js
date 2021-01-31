/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. */

'use strict'

module.exports = class Modal {

    constructor () {
        this.overlay = d3.select('body').append('div')
            .class('modal')

        this.box = this.overlay.append('div')
                .class('box')
        this.header = this.box.append('header')
        this.body = this.box.append('div').class('body')
    }

    title (string) {
        this.header.html(string)
        return this
    }

    id (string) {
        this.box.id(string)
        return this
    }

    display () {
        this.overlay.style('display', 'flex')

        // Destroy on click outside the box
        this.overlay.on('click', () => {
            if (event.target === this.overlay.node())
                this.destroy()
        })
    }

    destroy () {
        this.overlay.remove()
    }

    _createBody () {
        return null
    }
}
