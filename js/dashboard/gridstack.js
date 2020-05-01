'use strict'
const { config } = require('../config')
require('gridstack/dist/gridstack.all')

module.exports = class Gridstack {

    constructor (container = '#grid') {
        d3.select(container)
            .class('grid-stack')

        let options = {
            cellHeight: 10,
            column: 50,
            float: true,
            handle: 'header',
            resizable: {
                handles: 'se, sw'
            }
        }

        this.grid = GridStack.init(options)
        this.grid.on('change', () => this.save())

        this._convertDivs()
    }

    itemsDefault = [
            { id: 'chart', x: 0, y: 0, width: 9, height: 10, },
            { id: 'trading', x: 9, y: 0, width: 3, height: 5, },
            { id: 'position-orders', x: 0, y: 10, width: 7, height: 4, },
            { id: 'wallet', x: 7, y: 10, width: 3, height: 4, },
            { id: 'book', x: 9, y: 5, width: 3, height: 5, },
            { id: 'trades', x: 10, y: 10, width: 2, height: 4, },
        ]

    items = config.get('grid') || this.itemsDefault

    _convertDivs() {
        d3.selectAll('#main-grid>div')
            .each((d, i, nodes) => this._wrapDiv(d, i, nodes))
    }

    _wrapDiv (d, i, nodes) {
        let widget = d3.select(nodes[i]).remove()
        let wrapper = document.createElement('div')
        let options = this.items.filter(x => x.id === widget.id())[0]
        widget.class('grid-stack-item-content')

        wrapper.append(widget.node())

        this.grid.addWidget(wrapper, options)
    }

    save () {
        let data = []
        this.grid.engine.nodes.forEach(node =>
            data.push({
                id: node.id,
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height
            })
        )
        config.set('grid', data)
    }
}
