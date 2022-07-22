import { format } from 'd3';
import React, {
  memo, ReactElement, useCallback, useState,
} from 'react';
import {
  Button, ModalFooter, Nav, NavItem, NavLink,
} from 'reactstrap';
import { useSilent, useValue } from 'use-change';
import { TRADING } from '../../../store';
import LabeledInput from '../../controls/LabeledInput';
import Modal, { ModalBody, ModalHeader } from '../../layout/Modal';

interface Props {
  symbol: string | null;
  onClose: () => void;
}

// How to Adjust Margin Balance in Cross/Isolated Margin Modes https://www.binance.com/en/support/faq/360038447311
// Modify Isolated Position Margin https://binance-docs.github.io/apidocs/futures/en/#modify-isolated-position-margin-trade
const AdjustMarginModal = ({
  symbol,
  onClose,
}: Props): ReactElement => {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState<'ADD' | 'REMOVE'>('ADD');
  const openPositions = useValue(TRADING, 'openPositions');
  const adjustPositionMargin = useSilent(TRADING, 'adjustPositionMargin');
  const getMarginAdjustmentInfo = useSilent(TRADING, 'getMarginAdjustmentInfo');
  const calculateLiquidationPrice = useSilent(TRADING, 'calculateLiquidationPrice');
  const position = openPositions.find((pos) => pos.symbol === symbol);
  const isValid = !!+value;
  const { addable, removable } = getMarginAdjustmentInfo(position);

  const adjust = useCallback(async () => {
    if (position && isValid) {
      if (await adjustPositionMargin(position.symbol, +value || 0, mode)) {
        onClose();
      }
    }
  }, [adjustPositionMargin, isValid, mode, onClose, position, value]);

  const estLiquidation = position ? calculateLiquidationPrice({
    ...position,
    isolatedWallet: position.isolatedWallet + (mode === 'ADD' ? 1 : -1) * +value,
  }) : 0;

  return (
    <Modal isOpen={typeof symbol === 'string'} onRequestClose={onClose}>
      {typeof symbol === 'string' && (
      <>
        <ModalHeader onRequestClose={onClose}>
          <Nav tabs>
            <NavItem>
              <NavLink active={mode === 'ADD'} onClick={() => setMode('ADD')} className="cursor-pointer">Add Margin</NavLink>
            </NavItem>
            <NavItem>
              <NavLink active={mode === 'REMOVE'} onClick={() => setMode('REMOVE')} className="cursor-pointer">Remove Margin</NavLink>
            </NavItem>
          </Nav>
        </ModalHeader>
        <ModalBody>
          <label className="mb-1" htmlFor="adjustMarginAmount">Amount</label>
          <p>
            <LabeledInput
              label="$"
              type="text"
              id="adjustMarginAmount"
              value={value}
              className="mb-2"
              onPressEnter={() => void adjust()}
              onChange={setValue}
            />
          </p>
          <p>
            Current margin:
            {' '}
            {format(',.2f')(position?.isolatedWallet || 0)}
            &nbsp;$
          </p>
          <p>
            {mode === 'ADD' && (
              <>
                Max addable:
                {' '}
                {format(',.2f')(addable)}
                &nbsp;$
              </>
            )}
          </p>
          <p>
            {mode === 'REMOVE' && (
              <>
                Max removable:
                {' '}
                {format(',.2f')(removable)}
                &nbsp;$
              </>
            )}
          </p>
          <p>
            Est. liq. price after
            {' '}
            {mode === 'ADD' ? 'increase' : 'reduction'}
            :
            {' '}
            {format(',.2f')(estLiquidation)}
            &nbsp;$
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={!isValid} onClick={() => void adjust()}>Confirm</Button>
        </ModalFooter>
      </>
      )}
    </Modal>
  );
};

export default memo(AdjustMarginModal);
