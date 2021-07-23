import { Layout } from 'react-grid-layout';
interface WidgetData {
    hasSettings: boolean;
    element: HTMLElement;
    settingsElement: HTMLElement | null;
    id: string;
    title: string;
    pluginId: string;
    layout?: Partial<Pick<Layout, 'w' | 'h' | 'x' | 'y' | 'minH' | 'minW' | 'maxH' | 'maxW'>>;
    noPadding?: boolean;
    bodyClassName?: string;
    shouldCheckAccount?: boolean;
    isWidgetInitiallyEnabled: boolean;
    currentScript: HTMLOrSVGScriptElement;
    listenSettingsSave: (handler: () => void) => (() => void);
    listenSettingsCancel: (handler: () => void) => (() => void);
    listenIsWidgetEnabled: (handler: (isEnabled: boolean) => void) => (() => void);
    listenWidgetDestroy: (handler: () => void) => (() => void);
    onSettingsSave: () => void;
    onSettingsCancel: () => void;
    onSetEnabled: (isEnabled: boolean) => void;
    onDestroy: () => void;
}
interface PluginInfo {
    name: string;
    id: string;
    version: string | null;
    description: string;
    main: string | null;
    isDefault: boolean;
    isThirdParty: boolean;
    isDevelopment: boolean;
}
declare type WidgetId = 'chart' | 'trading' | 'positionAndOrders' | 'lastTrades' | 'orderBook' | 'wallet';
export default class App {
    #private;
    defaultPlugins: PluginInfo[];
    customPlugins: PluginInfo[];
    readonly builtInWidgets: {
        id: WidgetId;
        title: string;
    }[];
    pluginWidgets: WidgetData[];
    arePluginsLoading: boolean;
    didPluginsInitialized: boolean;
    constructor(store: Store);
    createWidget: ({ hasSettings, id, title, layout, noPadding, bodyClassName, shouldCheckAccount, currentScript, }: {
        hasSettings: boolean;
        id: string;
        title: string;
        layout: Layout;
        noPadding?: boolean | undefined;
        bodyClassName?: string | undefined;
        shouldCheckAccount?: boolean | undefined;
        currentScript: HTMLOrSVGScriptElement;
    }) => Omit<WidgetData, 'onSettingsSave' | 'onSettingsCancel' | 'onSetEnabled' | 'onDestroy'>;
    enablePlugin: (id: string, { isDefault, isThirdParty }: {
        isDefault: boolean;
        isThirdParty: boolean;
    }) => Promise<void>;
    disablePlugin: (id: string) => void;
}
export {};
//# sourceMappingURL=Customization.d.ts.map