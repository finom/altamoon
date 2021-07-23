import { ReactElement, ReactNode } from 'react';
export { default as ModalBody } from './ModalBody';
export { default as ModalHeader } from './ModalHeader';
export { default as ModalFooter } from './ModalFooter';
interface Props {
    fillIn?: boolean;
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
declare const Modal: ({ fillIn, isOpen, title, overlayClassName, dialogClassName, modalContentClassName, color, children, onAfterOpen, onRequestClose, }: Props) => ReactElement;
export default Modal;
//# sourceMappingURL=index.d.ts.map