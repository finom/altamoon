import React, {
  ReactElement, useCallback, useMemo, useState,
} from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert,
} from 'reactstrap';
import usePromise from 'react-use-promise';
import { format } from 'd3';
import { useSilent, useValue } from 'use-change';

import * as api from '../../../api';
import LabeledInput from '../../controls/LabeledInput';
import css from './style.css';
import { RootStore } from '../../../store';
import truncateDecimals from '../../../lib/truncateDecimals';
import stringifyError from '../../../lib/stringifyError';

const TransferFunds = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFromSpotToFutures, setIsFromSpotToFutures] = useState(true);
  const [currency, setCurrency] = useState<'USDT' | 'BNB'>('USDT');
  const [quantity, setQuantity] = useState(0);
  const futuresAccount = useValue(({ account }: RootStore) => account, 'futuresAccount');
  const reloadFuturesAccount = useSilent(({ account }: RootStore) => account, 'reloadFuturesAccount');
  const [lastTransactionId, setLastTransactionId] = useState<number>();
  const [spotBalance] = usePromise<Record<string, { locked: number; available: number; }>>(
    () => (isOpen ? api.balance() : Promise.resolve({})),
    [isOpen, lastTransactionId],
  );
  const available: string | undefined = useMemo(() => (isFromSpotToFutures
    ? spotBalance?.[currency]?.available?.toString()
    : futuresAccount?.assets.find(({ asset }) => asset === currency)?.maxWithdrawAmount),
  [spotBalance, currency, futuresAccount?.assets, isFromSpotToFutures]);

  const toggleModal = useCallback(() => setIsOpen((v) => !v), []);
  const availableNum: number = available ? truncateDecimals(+available, 2) : 0;
  const hasError: boolean = !!availableNum && !!quantity && availableNum < quantity;
  const canTransfer: boolean = !hasError && !!availableNum && quantity > 0;
  const [transferError, setTransferError] = useState<null | string>(null);
  const transfer = useCallback(async () => {
    if (canTransfer) {
      try {
        const resp = await api.transfer({
          asset: currency,
          amount: quantity,
          isFromSpotToFutures,
        });

        if (resp) {
          setLastTransactionId(resp.tranId);
          setQuantity(0);
          void reloadFuturesAccount();
        }
      } catch (e) {
        setTransferError(stringifyError(e));
      }
    }
  }, [canTransfer, currency, isFromSpotToFutures, quantity, reloadFuturesAccount]);

  return (
    <>
      <Button color="link" onClick={toggleModal}>Transfer funds</Button>
      <Modal isOpen={isOpen} toggle={toggleModal} unmountOnClose>
        <ModalHeader toggle={toggleModal}>Transfer funds between wallets</ModalHeader>
        <ModalBody className={css.transferModal}>
          {transferError && <Alert color="danger">{transferError}</Alert>}
          <table>
            <tbody>
              <tr>
                <td>From</td>
                <td />
                <td>To</td>
              </tr>
              <tr className={css.direction}>
                <td>
                  <div className={css.source}>{isFromSpotToFutures ? 'Spot' : 'Futures'}</div>
                </td>
                <td>
                  <div
                    className={css.switch}
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsFromSpotToFutures((v) => !v)}
                    onKeyDown={() => setIsFromSpotToFutures((v) => !v)}
                  >
                    <div>⇌</div>
                  </div>
                </td>
                <td>
                  <div className={css.target}>{isFromSpotToFutures ? 'Futures' : 'Spot'}</div>
                </td>
              </tr>
            </tbody>
          </table>

          <LabeledInput
            label="Qty"
            id="transferQty"
            type="number"
            onChange={(v) => setQuantity(+v || 0)}
            value={`${quantity}`}
          >
            <select
              value={currency}
              onChange={({ target }) => setCurrency(target.value as 'USDT' | 'BNB')}
            >
              <option value="USDT">USDT</option>
              <option value="BNB">BNB</option>
            </select>
          </LabeledInput>
          {hasError && (
            <div className="invalid-feedback d-block">
              Please provide valid quantity that not more than your available funds.
            </div>
          )}

          <div className="mt-3 text-center">
            Available:
            {' '}
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              href=""
              onClick={(evt) => {
                evt.preventDefault();
                setQuantity(availableNum);
              }}
            >
              {available ? format(',~f')(truncateDecimals(+available, 2)) : 'Loading...'}
              {' '}
              {available ? currency : ''}
            </a>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={!canTransfer} onClick={transfer}>Confirm transfer</Button>
          {' '}
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TransferFunds;

/* Copyright 2020-2021 Pascal Reinhard

This file is published under the terms of the GNU Affero General Public License
as published by the Free Software Foundation, either version 3 of the License,
or (at your option) any later version. See <https://www.gnu.org/licenses/>. * /

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
                <td><div class="source"> Spot </div></td>
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
        this.max.on('click', () => this._copyMax())
        this.confirm.on('click', () => this._confirm())
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
                x => x.asset == this._getCurrency()
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
*/
