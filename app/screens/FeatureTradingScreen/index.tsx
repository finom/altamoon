import React, {
  MutableRefObject, ReactElement, useCallback, useState,
} from 'react';
import { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import { Button, Input, Navbar } from 'reactstrap';
import classNames from 'classnames';
import useChange, { useValue } from 'use-change';

import { LayoutWtf, Puzzle } from 'react-bootstrap-icons';
import LastTradesWidget from '../../components/widgets/LastTradesWidget';
import {
  CUSTOMIZATION, MARKET, PERSISTENT, RootStore,
} from '../../store';
import { darkTheme, lightTheme } from '../../themes';
import OrderBookWidget from '../../components/widgets/OrderBookWidget';
import WalletWidget from '../../components/widgets/WalletWidget';
import ChartWidget from '../../components/widgets/ChartWidget';
import TradingWidget from '../../components/widgets/TradingWidget';
import SettingsModal from '../../components/modals/SettingsModal';
import SettingsButton from '../../components/controls/SettingsButton';
import PositionsAndOrdersWidget from '../../components/widgets/PositionsAndOrdersWidget';
import Widget from '../../components/layout/Widget';
import DOMElement from '../../components/layout/DOMElement';
import PluginsModal from '../../components/modals/PluginsModal';
import WidgetsSelect from '../../components/widgets/WidgetsSelect';
import convertType from '../../lib/convertType';
import css from './style.css';

const breakpoints = {
  lg: 100, md: 0, sm: 0, xs: 0, xxs: 0,
};

const defaultPluginLayout = {
  minH: 2, minW: 2, h: 4, w: 4, x: 0, y: 0,
};

const rowHeight = 30;

const widgetComponents: Record<RootStore['customization']['builtInWidgets'][0]['id'], {
  RenderWidget: (({ title, id }: { title: string; id: string; }) => ReactElement)
  | ReturnType<typeof React.memo>,
  grid: Record<string, number>
}> = {
  chart: {
    RenderWidget: ChartWidget,
    grid: {
      h: 13, minH: 3, minW: 2, w: 12, x: 0, y: 0,
    },
  },
  trading: {
    RenderWidget: TradingWidget,
    grid: {
      h: 13, minH: 3, minW: 2, w: 9, x: 0, y: 17,
    },
  },
  positionAndOrders: {
    RenderWidget: PositionsAndOrdersWidget,
    grid: {
      h: 8, minH: 3, minW: 2, w: 12, x: 0, y: 30,
    },
  },
  lastTrades: {
    RenderWidget: LastTradesWidget,
    grid: {
      h: 6, minH: 3, minW: 2, w: 5, x: 0, y: 38,
    },
  },
  orderBook: {
    RenderWidget: OrderBookWidget,
    grid: {
      h: 6, minH: 3, minW: 2, w: 7, x: 5, y: 38,
    },
  },
  wallet: {
    RenderWidget: WalletWidget,
    grid: {
      h: 13, minH: 3, minW: 2, w: 3, x: 9, y: 17,
    },
  },
};

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const FeatureTradingScreen = (): ReactElement => {
  const [layout, setLayout] = useChange(PERSISTENT, 'layout');
  const [existingSymbol, setSymbol] = useChange(PERSISTENT, 'symbol');
  const theme = useValue(PERSISTENT, 'theme');
  const widgetsDisabled = useValue(PERSISTENT, 'widgetsDisabled');
  const numberOfColumns = useValue(PERSISTENT, 'numberOfColumns');
  const pluginWidgets = useValue(CUSTOMIZATION, 'pluginWidgets').filter(({ id }) => !widgetsDisabled.includes(id));
  const builtInWidgets = useValue(CUSTOMIZATION, 'builtInWidgets').filter(({ id }) => !widgetsDisabled.includes(id));
  const didPluginsInitialized = useValue(CUSTOMIZATION, 'didPluginsInitialized');
  const futuresExchangeSymbols = Object.values(useValue(MARKET, 'futuresExchangeSymbols')).sort(((a, b) => (a.symbol > b.symbol ? 1 : -1)));
  const [isPluginsModalOpen, setIsPluginsModalOpen] = useState(false);
  const onLayoutChange = useCallback((changedLayout: Layout[] /* , changedLayouts: Layouts */) => {
    setLayout(changedLayout);
  }, [setLayout]);
  const resetLayout = useCallback(() => { setLayout([]); }, [setLayout]);
  const cols = {
    lg: numberOfColumns,
    md: numberOfColumns,
    sm: numberOfColumns,
    xs: numberOfColumns,
    xxs: numberOfColumns,
  };

  return (
    <div>
      <SettingsModal />
      <PluginsModal
        isOpen={isPluginsModalOpen}
        onRequestClose={() => setIsPluginsModalOpen(false)}
      />
      {theme === 'dark' ? <style>{darkTheme}</style> : <style>{lightTheme}</style>}
      <Navbar
        className={classNames({
          'bg-dark': theme === 'dark',
          'bg-light': theme !== 'dark',
          [css.header]: true,
        })}
      >
        <div>
          <Input type="select" value={existingSymbol} onChange={({ target }) => setSymbol(target.value)}>
            {futuresExchangeSymbols.length
              ? futuresExchangeSymbols.map(({ symbol, baseAsset, quoteAsset }) => (
                <option key={symbol} value={symbol}>
                  {baseAsset}
                  /
                  {quoteAsset}
                </option>
              )) : <option>Loading...</option>}
          </Input>
        </div>
        <div>
          <Button
            color={theme === 'dark' ? 'dark' : 'light'}
            onClick={resetLayout}
          >
            <LayoutWtf size={16} />
            {' '}
            Reset Layout
          </Button>
          {' '}
          <SettingsButton />
          {' '}
          <Button
            color={theme === 'dark' ? 'dark' : 'light'}
            onClick={() => setIsPluginsModalOpen(true)}
          >
            <Puzzle size={16} />
            {' '}
            Plugins
          </Button>
          <WidgetsSelect />
        </div>
      </Navbar>
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
          layouts={{ lg: layout }}
          onLayoutChange={onLayoutChange}
        >
          {builtInWidgets.map(({ id, title }) => {
            const { grid, RenderWidget } = widgetComponents[id];
            return (
              <div key={id} data-grid={grid}>
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
              data-grid={layout.find(({ i }) => i === id)
                ?? (itemLayout ? { ...defaultPluginLayout, ...itemLayout } : defaultPluginLayout)}
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
                <DOMElement>{element}</DOMElement>
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

export default FeatureTradingScreen;
