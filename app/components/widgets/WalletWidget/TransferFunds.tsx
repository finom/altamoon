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
import { ACCOUNT, PERSISTENT } from '../../../store';
import truncateDecimals from '../../../lib/truncateDecimals';
import stringifyError from '../../../lib/stringifyError';

const TransferFunds = (): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFromSpotToFutures, setIsFromSpotToFutures] = useState(true);
  const [currency, setCurrency] = useState<'USDT' | 'BNB'>('USDT');
  const [quantity, setQuantity] = useState(0);
  const futuresAccount = useValue(ACCOUNT, 'futuresAccount');
  const reloadFuturesAccount = useSilent(ACCOUNT, 'reloadFuturesAccount');
  const isTestnet = useValue(PERSISTENT, 'isTestnet');

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
      <Button color="link" onClick={toggleModal} className={isTestnet ? 'pe-none o-50' : undefined}>Transfer funds</Button>
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
          <Button color="primary" disabled={!canTransfer} onClick={() => void transfer()}>Confirm transfer</Button>
          {' '}
          <Button color="secondary" onClick={toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TransferFunds;
