import { listenChange } from 'use-change';
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
  listenSettingsSave: (handler: () => void) => (() => void);
  onSettingsSave: () => void;
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
  }: {
    hasSettings: boolean;
    id: string;
    title: string;
    noPadding?: boolean;
    bodyClassName?: string;
    shouldCheckAccount?: boolean;
  }): Omit<WidgetData, 'onSettingsSave'> => {
    const element = document.createElement('div');
    const settingsElement = hasSettings ? document.createElement('div') : null;
    const eventTarget = { saveCount: 0 };
    const listenSettingsSave = (handler: () => void) => listenChange(eventTarget, 'saveCount', () => handler());
    const onSettingsSave = () => {
      eventTarget.saveCount += 1;
    };
    const widgetData: Omit<WidgetData, 'onSettingsSave'> = {
      element,
      settingsElement,
      hasSettings,
      id,
      title,
      noPadding,
      bodyClassName,
      shouldCheckAccount,
      listenSettingsSave,
    };

    this.customWidgets = [...this.customWidgets, { ...widgetData, onSettingsSave }];

    return widgetData;
  };
}
