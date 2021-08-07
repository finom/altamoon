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
  const position = openPositions.find((pos) => pos.symbol === symbol);
  const isValid = !!+value;

  const adjust = useCallback(async () => {
    if (position && isValid) {
      if (await adjustPositionMargin(position.symbol, +value || 0, mode)) {
        onClose();
      }
    }
  }, [adjustPositionMargin, isValid, mode, onClose, position, value]);

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
          <LabeledInput
            label="₮"
            type="text"
            id="adjustMarginAmount"
            value={value}
            className="mb-2"
            onPressEnter={adjust}
            onChange={setValue}
          />
          Current margin:
          {' '}
          {format(',.2f')(position?.isolatedWallet || 0)}
          &nbsp;₮
        </ModalBody>
        <ModalFooter>
          <Button color="primary" disabled={!isValid} onClick={adjust}>Confirm</Button>
        </ModalFooter>
      </>
      )}
    </Modal>
  );
};

export default memo(AdjustMarginModal);
