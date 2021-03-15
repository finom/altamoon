import React, { ReactElement, ReactNode, useMemo } from 'react';
import ReactModal from 'react-modal';
import classNames from 'classnames';

import css from './style.css';

export { default as ModalBody } from './ModalBody';
export { default as ModalHeader } from './ModalHeader';
export { default as ModalFooter } from './ModalFooter';

ReactModal.setAppElement('body');

interface Props {
  fillIn?: boolean,
  isOpen: boolean;
  title?: string;
  overlayClassName?: string;
  modalContentClassName?: string;
  dialogClassName?: string;
  color?: string;
  children: ReactNode;

  onAfterOpen?: () => void;
  onRequestClose: () => void;
}

const style = {
  content: {},
  overlay: {},
};

const Modal = ({
  fillIn,
  isOpen,
  title,
  overlayClassName,
  dialogClassName,
  modalContentClassName,
  color,
  children,

  onAfterOpen,
  onRequestClose,
}: Props): ReactElement => {
  const settings = useMemo(() => ({
    overlayClassName: {
      base: classNames({
        modal: true,
        fade: true,
        [`modal-${String(color)}`]: !!color,
        'modal-fill-in': !!fillIn,
        [css.overlay]: true,
        [String(overlayClassName)]: !!overlayClassName,
      }),
      afterOpen: 'show',
      beforeClose: css.hide,
    },
    className: {
      base: classNames({
        'modal-dialog': true,
        [String(dialogClassName)]: !!dialogClassName,
      }),
      afterOpen: '',
      beforeClose: '',
    },
    modalContentClassName: classNames({
      'modal-content': true,
      [String(modalContentClassName)]: !!modalContentClassName,
    }),
  }), [color, fillIn, overlayClassName, dialogClassName, modalContentClassName]);

  return (
    <ReactModal
      isOpen={isOpen}
      closeTimeoutMS={200}
      style={style}
      className={settings.className}
      overlayClassName={settings.overlayClassName}
      contentLabel={title || ''}
      onAfterOpen={onAfterOpen}
      onRequestClose={onRequestClose}
    >
      <div className={settings.modalContentClassName}>
        {children}
      </div>
    </ReactModal>
  );
};

export default Modal;
