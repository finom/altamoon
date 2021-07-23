import { ReactElement, ReactNode } from 'react';
interface Props {
    children?: ReactNode;
    title?: ReactElement | string;
    className?: string;
    onRequestClose: () => void;
}
declare const ModalHeader: ({ children, title, className, onRequestClose, }: Props) => ReactElement;
export default ModalHeader;
//# sourceMappingURL=ModalHeader.d.ts.map