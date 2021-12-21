import React, {
  FormEvent, ReactElement, useCallback, useState,
} from 'react';
import { Button, Form, Input } from 'reactstrap';
import { useSilent } from 'use-change';
import { PERSISTENT } from '../../../store';
import Modal, { ModalHeader, ModalFooter, ModalBody } from '../../../components/layout/Modal';

interface Props {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const NewLayoutModal = ({ isOpen, setIsOpen }: Props): ReactElement => {
  const [name, setName] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const isValid = !!name || !isDirty;
  const addLayout = useSilent(PERSISTENT, 'addLayout');
  const closeModal = useCallback(() => {
    setIsDirty(false);
    setIsOpen(false);
  }, [setIsOpen]);
  const onSubmit = useCallback((evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (!name) return;
    addLayout(name);
    closeModal();
  }, [addLayout, closeModal, name]);

  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal}>
      <ModalHeader onRequestClose={closeModal}>Create new layout</ModalHeader>
      <ModalBody>
        <Form id="settings" onSubmit={onSubmit}>
          <label htmlFor="new_layout_name" className="mb-1">Layout name</label>
          <Input
            type="text"
            value={name}
            id="new_layout_name"
            placeholder="Layout name"
            onChange={({ target }) => {
              setName(target.value);
              setIsDirty(true);
            }}
            invalid={!isValid}
          />
          {!isValid && (
            <div className="invalid-feedback">
              Please provide a layout name.
            </div>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button form="settings" type="submit" color="primary" disabled={!name}>Save</Button>
      </ModalFooter>
    </Modal>
  );
};

export default NewLayoutModal;
