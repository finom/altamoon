import { ReactElement } from 'react';
interface Props {
    id: string;
    checkedLabel: string;
    uncheckedLabel: string;
    className?: string;
    isChecked: boolean;
    onChange: (v: boolean) => void;
}
declare const Toggle: ({ id, checkedLabel, uncheckedLabel, className, isChecked, onChange, }: Props) => ReactElement;
export default Toggle;
//# sourceMappingURL=index.d.ts.map