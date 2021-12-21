import React, {
  MutableRefObject, ReactElement, useCallback, useMemo,
} from 'react';
import { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import useChange, { useValue } from 'use-change';

import { keyBy, pick } from 'lodash';
import LastTradesWidget from '../../components/widgets/LastTradesWidget';
import { CUSTOMIZATION, PERSISTENT, RootStore } from '../../store';
import { darkTheme, lightTheme } from '../../themes';
import OrderBookWidget from '../../components/widgets/OrderBookWidget';
import WalletWidget from '../../components/widgets/WalletWidget';
import ChartWidget from '../../components/widgets/ChartWidget';
import TradingWidget from '../../components/widgets/TradingWidget';
import PositionsAndOrdersWidget from '../../components/widgets/PositionsAndOrdersWidget';
import MinichartsWidget from '../../components/widgets/MinichartsWidget';
import Widget from '../../components/layout/Widget';
import DOMElement from '../../components/layout/DOMElement';
import convertType from '../../lib/convertType';
import Headbar from './Headbar';
import css from './style.css';

const breakpoints = { xxs: 0 };
const defaultLayoutPartial = { minH: 5, minW: 10 };
const defaultPluginLayout = {
  h: 40, w: 40, x: 0, y: 0, ...defaultLayoutPartial,
};
const rowHeight = 10;

const widgetComponents: Record<RootStore['customization']['builtInWidgets'][0]['id'], ReturnType<typeof React.memo>> = {
  chart: ChartWidget,
  trading: TradingWidget,
  positionAndOrders: PositionsAndOrdersWidget,
  lastTrades: LastTradesWidget,
  orderBook: OrderBookWidget,
  wallet: WalletWidget,
  minicharts: MinichartsWidget,
};

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const FuturesTradingScreen = (): ReactElement => {
  const [widgetLayouts, setWidgetLayouts] = useChange(PERSISTENT, 'widgetLayouts');
  const enabledLayout = widgetLayouts.find(({ isEnabled }) => isEnabled);

  const gridLayout = useMemo(() => {
    if (!enabledLayout) return [];

    return Object.entries(enabledLayout.individualLayouts).map(([i, l]) => ({
      ...l, i, ...defaultLayoutPartial,
    }));
  }, [enabledLayout]);
  const individualLayouts = enabledLayout?.individualLayouts;
  const layouts = useMemo(() => ({ xxs: gridLayout }), [gridLayout]);
  const theme = useValue(PERSISTENT, 'theme');
  const widgetsDisabled = useValue(PERSISTENT, 'widgetsDisabled');
  const numberOfColumns = useValue(PERSISTENT, 'widgetsNumberOfColumns');
  const pluginWidgets = useValue(CUSTOMIZATION, 'pluginWidgets').filter(({ id }) => !widgetsDisabled.includes(id));
  const builtInWidgets = useValue(CUSTOMIZATION, 'builtInWidgets').filter(({ id }) => !widgetsDisabled.includes(id));
  const didPluginsInitialized = useValue(CUSTOMIZATION, 'didPluginsInitialized');
  const onLayoutChange = useCallback((changedLayout: Layout[]) => {
    console.log('changedLayout');
    setWidgetLayouts((v) => v.map((layout) => {
      if (!layout.isEnabled) return layout;

      return {
        ...layout,
        individualLayouts: {
          ...layout.individualLayouts,
          ...keyBy(changedLayout.map((l) => pick(l, ['x', 'y', 'w', 'h', 'i'])), 'i'),
        },
      };
    }));
  }, [setWidgetLayouts]);
  const cols = {
    lg: numberOfColumns,
    md: numberOfColumns,
    sm: numberOfColumns,
    xs: numberOfColumns,
    xxs: numberOfColumns,
  };

  return (
    <div>
      {theme === 'dark' ? <style>{darkTheme}</style> : <style>{lightTheme}</style>}
      <Headbar />
      {didPluginsInitialized && (
        <ResponsiveReactGridLayout
          key={numberOfColumns}
          draggableHandle=".card-header"
          ref={(instance) => {
            if (instance) {
              const {
                elementRef,
              } = convertType<{ elementRef: MutableRefObject<HTMLElement> }>(instance);
              if (elementRef.current) {
                elementRef.current.style.filter = 'none';
              }
            }
          }}
          className={`layout ${css.grid}`}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={rowHeight}
          layouts={layouts}
          onLayoutChange={onLayoutChange}
        >
          {builtInWidgets.map(({ id, title }) => {
            const RenderWidget = widgetComponents[id];
            return (
              <div key={id} data-grid={individualLayouts?.[id]}>
                <RenderWidget id={id} title={title} />
              </div>
            );
          })}
          {pluginWidgets.map(({
            title,
            id,
            hasSettings,
            settingsElement,
            canSettingsSave,
            element,
            noPadding,
            layout: itemLayout,
            bodyClassName,
            shouldCheckAccount,
            onSettingsSave,
            onSettingsCancel,
          }) => (
            <div
              key={id}
              data-grid={
                individualLayouts?.[id]
                ?? (itemLayout ? { ...defaultPluginLayout, ...itemLayout } : null)
                ?? defaultPluginLayout
}
            >
              <Widget
                id={id}
                title={title}
                settings={hasSettings ? <DOMElement>{settingsElement}</DOMElement> : null}
                canSettingsSave={canSettingsSave}
                noPadding={noPadding}
                bodyClassName={bodyClassName}
                shouldCheckAccount={shouldCheckAccount}
                onSettingsSave={onSettingsSave}
                onSettingsCancel={onSettingsCancel}
              >
                <DOMElement className="h-100">{element}</DOMElement>
              </Widget>
            </div>
          ))}
        </ResponsiveReactGridLayout>
      )}

      {!didPluginsInitialized && (
      <div className="text-center w-100 position-fixed top-50">
        <div className="text-primary spinner-border" />
      </div>
      )}
    </div>
  );
};

export default FuturesTradingScreen;
