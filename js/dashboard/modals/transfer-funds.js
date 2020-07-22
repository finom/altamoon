'use strict'
const Modal = require('./modal')
const api = require('../../apis/futures')
const { parseInputNumber, truncateDecimals } = require('../../snippets')


module.exports = class TransferModal extends Modal {

    constructor () {
        super()
        this.title('Transfer between wallets')
            .id('transfer-modal')

        this.direction = 1 // 1 = Spot to Futures | 2 = The opposite
        this._createBody()
    }

    _createBody () {
        this.body.html(`
        <table>
            <tr>
                <td>From</td>
                <td></td>
                <td>To</td>
            </tr>
            <tr class="direction">
                <td><div class="source">  Spot  </div></td>
                <td><div class="switch"><div>⇌</div></div></td>
                <td><div class="target">Futures</div></td>
            </tr>
        </table>
        <div class="input">
            <label for="transfer-qty">Qty</label>
            <input id="transfer-qty" />
            <select class="currency">
                <option value="USDT">USDT</option>
                <option value="BNB">BNB</option>
            </select>
        </div>
        <div class="max">Available: <span class="link"></span></div>
        <button class="btn">Confirm transfer</button></div>
        `)

        this.source = this.body.select('.source')
        this.target = this.body.select('.target')
        this.switch = this.body.select('.switch')
        this.qty = this.body.select('#transfer-qty')
        this.currency = this.body.select('.currency')
        this.max = this.body.select('.max span')
        this.confirm = this.body.select('button')

        this._getMax()

        this.switch.on('click', () => this._onSwitchDirection())
        this.qty.on('input', () => this._onInputQty())
        this.currency.on('change', () => this._onCurrencyChange())
        this.max.on('click', () => this._copyMax())
        this.confirm.on('click', () => this._confirm())
    }

    _getCurrency () {
        return this.currency.node().value
    }

    _getMax () {
        this.max.html('Retrieving amount...')
        this.maxQty = undefined

        if (this.direction === 1) {
            api.lib.balance((err, balances) => {
                if (err)
                    return console.error(error)

                if (this.direction === 2) // User switched before data fetched
                    return

                let max = balances[this._getCurrency()].available
                this._formatMax(max)
            })
        }
        else {
            let data = api.account.assets.filter(
                x => x.asset == this._getCurrency()
            )

            let max = data[0].maxWithdrawAmount
            this._formatMax(max)
        }
    }

    _formatMax(max) {
        let currency = ' ' + this._getCurrency()
        this.maxQty = truncateDecimals(max, 2)
        this.max.html(nFormat(',~f', this.maxQty) + currency)

        this._checkQty()
    }

    _copyMax () {
        if (this.maxQty !== undefined )
            this.qty.value(this.maxQty)
    }

    _onInputQty () {
        parseInputNumber()
        this._checkQty()
    }

    _onSwitchDirection () {
        if (this.direction === 1) {
            this.direction = 2
            this.source.html('Futures')
            this.target.html('Spot')
        }
        else {
            this.direction = 1
            this.source.html('Spot')
            this.target.html('Futures')
        }
        this.qty.value('')
        this._getMax()
    }

    _onCurrencyChange () {
        this.qty.value('')
        this._getMax()
    }

    _checkQty () {
        if (this.maxQty && this.qty.value() > this.maxQty) {
            this.qty.class('invalid')
            this.confirm.class('invalid')
            return false
        }
        else {
            this.qty.class(null)
            this.confirm.class(null)
            return true
        }
    }

    _confirm () {
        if (!this._checkQty())
            return

        // Todo: use node.binance.api transfer func when available
        let url = 'https://api.binance.com/sapi/v1/futures/transfer'
        let data = {
            asset: this._getCurrency(),
            amount: this.qty.value(),
            type: this.direction
        }
        api.lib.signedRequest(url, data, null, 'POST')
        this.destroy()
    }
}
