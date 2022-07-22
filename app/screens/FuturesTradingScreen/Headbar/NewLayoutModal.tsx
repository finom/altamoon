/* eslint-disable react/jsx-props-no-spreading */
import React, {
  FormEvent, ReactElement, useCallback, useEffect, useMemo, useState,
} from 'react';
import { Button, Form, Input } from 'reactstrap';
import { useSilent } from 'use-change';
import { useDropzone } from 'react-dropzone';

import { AltamoonLayout } from '../../../store/types';
import { PERSISTENT } from '../../../store';
import Modal, { ModalHeader, ModalFooter, ModalBody } from '../../../components/layout/Modal';

export interface LayoutFileObject {
  fileType: 'altamoon-layout';
  name: string;
  individualLayouts: AltamoonLayout['individualLayouts'];
}

interface Props {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  padding: '20px',
  borderWidth: 2,
  borderRadius: 2,
  borderColor: '#25232316',
  borderStyle: 'dashed',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  color: '#bdbdbd',
  outline: 'none',
  transition: 'border .24s ease-in-out',
};

const activeStyle = {
  borderColor: '#2196f370',
};

const acceptStyle = {
  borderColor: '#00e67670',
};

const rejectStyle = {
  borderColor: '#ff174470',
};

const NewLayoutModal = ({ isOpen, setIsOpen }: Props): ReactElement => {
  const [name, setName] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const isValid = !!name || !isDirty;
  const addLayout = useSilent(PERSISTENT, 'addLayout');
  const closeModal = useCallback(() => {
    setIsDirty(false);
    setIsOpen(false);
  }, [setIsOpen]);
  const [layoutFileObject, setLayoutFileObject] = useState<LayoutFileObject | null>(null);
  const onSubmit = useCallback((evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (!name) return;
    addLayout(name, layoutFileObject?.fileType === 'altamoon-layout' ? layoutFileObject.individualLayouts : undefined);
    closeModal();
  }, [addLayout, closeModal, layoutFileObject, name]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const object = JSON.parse(fileReader.result as string) as LayoutFileObject;
      if (object.fileType === 'altamoon-layout' && !isDirty) {
        setName(object.name);
      }
      setLayoutFileObject(object);
    };

    fileReader.readAsText(acceptedFiles[0]);
  }, [isDirty]);
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    inputRef: fileInputRef,
  } = useDropzone({
    accept: { 'application/json': [] },
    maxFiles: 1,
    onDrop,
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {}),
  }), [
    isDragActive,
    isDragReject,
    isDragAccept,
  ]);

  // reset on close
  useEffect(() => {
    if (fileInputRef.current && !isOpen) {
      fileInputRef.current.value = '';
      setLayoutFileObject(null);
      setIsDirty(false);
      setName('');
    }
  }, [fileInputRef, isOpen]);

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
          <div {...getRootProps({ style })} className="mt-2">
            <input {...getInputProps()} />
            {isDragActive && <p className="m-0">Drop the files here ...</p>}
            {!isDragActive && !layoutFileObject && <p className="m-0">Drag&apos;n&apos;drop a layout file here, or click to select it.</p>}
            {!isDragActive && !!layoutFileObject && layoutFileObject.fileType !== 'altamoon-layout' && (
              <p className="m-0 text-warning">Layour file is invalid. Please select another file.</p>
            )}
            {!isDragActive && !!layoutFileObject && layoutFileObject.fileType === 'altamoon-layout' && (
              <p className="m-0 text-success">Layout file is valid.</p>
            )}
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button form="settings" type="submit" color="primary" disabled={!name}>Save</Button>
      </ModalFooter>
    </Modal>
  );
};

export default NewLayoutModal;
