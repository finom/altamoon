import { ReactElement } from 'react';
interface Props {
    id: string;
    name: string;
    version: string | null;
    description: string;
    isDefault: boolean;
    isEnabled: boolean;
    isThirdParty: boolean;
    isDevelopment: boolean;
    onEnablePlugin: (id: string) => void;
    onDisablePlugin: (id: string, shouldNotifyReload: boolean) => void;
}
declare const Plugin: ({ id, name, isThirdParty, description, version, isDefault, isDevelopment, isEnabled, onEnablePlugin, onDisablePlugin, }: Props) => ReactElement;
export default Plugin;
//# sourceMappingURL=Plugin.d.ts.map