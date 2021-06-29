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
  currentScript: HTMLScriptElement;
  listenSettingsSave: (handler: () => void) => (() => void);
  listenSettingsClose: (handler: () => void) => (() => void);
  onSettingsSave: () => void;
  onSettingsClose: () => void;
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
    currentScript,
  }: {
    hasSettings: boolean;
    id: string;
    title: string;
    noPadding?: boolean;
    bodyClassName?: string;
    shouldCheckAccount?: boolean;
    currentScript: HTMLScriptElement;
  }): Omit<WidgetData, 'onSettingsSave' | 'onSettingsClose'> => {
    const element = document.createElement('div');
    const settingsElement = hasSettings ? document.createElement('div') : null;
    const eventTarget = { saveCount: 0, cancelCount: 0 };

    const listenSettingsSave = (handler: () => void) => listenChange(eventTarget, 'saveCount', () => handler());
    const listenSettingsClose = (handler: () => void) => listenChange(eventTarget, 'cancelCount', () => handler());

    const onSettingsSave = () => { eventTarget.saveCount += 1; };
    const onSettingsClose = () => { eventTarget.cancelCount += 1; };

    const widgetData: Omit<WidgetData, 'onSettingsSave' | 'onSettingsClose'> = {
      element,
      settingsElement,
      hasSettings,
      id,
      title,
      noPadding,
      bodyClassName,
      shouldCheckAccount,
      currentScript,
      listenSettingsSave,
      listenSettingsClose,
    };

    this.customWidgets = [
      ...this.customWidgets,
      { ...widgetData, onSettingsSave, onSettingsClose },
    ];

    return widgetData;
  };
}
