'use strict'

const Store = require('electron-store')

const schema = {
    window: {
        type: 'object',
        properties: {
            height: {
                type: 'number',
                minimum: 200,
                default: 1050
            },
            width: {
                type: 'number',
                minimum: 400,
                default: 1920
            }
        },
        default: {} // See https://github.com/sindresorhus/electron-store/issues/102
    },
    order: {
        type: 'object',
        properties: {
            makerOnly: {
                type: 'boolean',
                default: true
            },
            qtyInterval: {
                type: 'number',
                default: 0.01
            },
        },
        default: {}
    }
}

exports.config = new Store({schema})
