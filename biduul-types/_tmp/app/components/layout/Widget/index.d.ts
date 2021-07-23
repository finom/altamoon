import { ReactElement, ReactNode, Ref } from 'react';
interface Props {
    id: string;
    title: string;
    noPadding?: boolean;
    bodyClassName?: string;
    settings?: ReactNode;
    children?: ReactNode;
    bodyRef?: Ref<HTMLElement>;
    shouldCheckAccount?: boolean;
    onSettingsCancel?: () => void;
    onSettingsSave?: () => void;
}
declare const Widget: ({ id, title, noPadding, bodyClassName, settings, children, bodyRef, shouldCheckAccount, onSettingsCancel, onSettingsSave, }: Props) => ReactElement;
export default Widget;
//# sourceMappingURL=index.d.ts.map