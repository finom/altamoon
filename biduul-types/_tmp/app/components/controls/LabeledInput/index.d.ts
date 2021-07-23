import { ReactElement, ReactNode, Ref } from 'react';
interface Props {
    label: string;
    rightLabel?: string | ReactElement;
    rightLabelClassName?: string;
    id: string;
    children?: ReactNode;
    type: 'text' | 'number';
    value: string;
    innerRef?: Ref<HTMLInputElement>;
    onPressEnter?: () => void;
    onChange: (value: string) => void;
}
declare const LabeledInput: ({ label, rightLabel, rightLabelClassName, children, id, type, value, innerRef, onChange, onPressEnter, }: Props) => ReactElement;
export default LabeledInput;
//# sourceMappingURL=index.d.ts.map