import * as api from '../api';
import { Plugin } from './types';

interface WidgetData {
  hasSettings: boolean;
  element: HTMLElement;
  settingsElement: HTMLElement | null;
  id: string;
  title: string;

  noPadding?: boolean;
  bodyClassName?: string;
  shouldCheckAccount?: boolean;
  onSettingsClose?: () => void;
  onSettingsSave?: () => void;
}

export default class Persistent {
  #store: Store;

  public customWidgets: WidgetData[] = [];

  #pluginPaths: string[] = ['http://localhost:8080/bundle.js'];

  constructor(store: Store) {
    this.#store = store;

    window.biduulPlugin = (plugin: Plugin): void => {
      plugin(this.#store, api);
    };

    for (const path of this.#pluginPaths) {
      const script = document.createElement('script');
      script.setAttribute('src', path);
      document.body.appendChild(script);
    }
  }

  public createWidget = ({
    hasSettings = false,
    id,
    title,
    noPadding,
    bodyClassName,
    shouldCheckAccount,
    onSettingsClose,
    onSettingsSave,
  }: {
    hasSettings: boolean;
    id: string;
    title: string;
    noPadding?: boolean;
    bodyClassName?: string;
    shouldCheckAccount?: boolean;
    onSettingsClose?: () => void;
    onSettingsSave?: () => void;
  }): WidgetData => {
    const element = document.createElement('div');
    const settingsElement = hasSettings ? document.createElement('div') : null;
    const widgetData: WidgetData = {
      element,
      settingsElement,
      hasSettings,
      id,
      title,
      noPadding,
      bodyClassName,
      shouldCheckAccount,
      onSettingsClose,
      onSettingsSave,
    };

    this.customWidgets = [...this.customWidgets, widgetData];

    return widgetData;
  };
}
