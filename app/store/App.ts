import * as api from '../api';
import { Plugin } from './types';

interface WidgetData {
  hasSettings: boolean;
  element: HTMLElement;
  settingsElement: HTMLElement | null;
}

export default class Persistent {
  #store: Store;

  public customWidgets: WidgetData[] = [];

  #pluginPaths: string[] = [];

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

  public createWidget = ({ hasSettings = false }: { hasSettings: boolean }): WidgetData => {
    const element = document.createElement('div');
    const settingsElement = hasSettings ? document.createElement('div') : null;

    return { element, settingsElement, hasSettings };
  };
}
