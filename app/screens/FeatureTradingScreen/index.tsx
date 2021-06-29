import React, { ReactElement, useCallback } from 'react';
import { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import { Button, Input, Navbar } from 'reactstrap';
import classNames from 'classnames';
import useChange, { useValue } from 'use-change';

import LastTradesWidget from '../../components/widgets/LastTradesWidget';
import { RootStore } from '../../store';
import { darkTheme, lightTheme } from '../../themes';
import css from './style.css';
import OrderBookWidget from '../../components/widgets/OrderBookWidget';
import WalletWidget from '../../components/widgets/WalletWidget';
import ChartWidget from '../../components/widgets/ChartWidget';
import TradingWidget from '../../components/widgets/TradingWidget';
import SettingsModal from '../../components/SettingsModal';
import SettingsButton from '../../components/controls/SettingsButton';
import PositionsAndOrdersWidget from '../../components/widgets/PositionsAndOrdersWidget';
import Widget from '../../components/layout/Widget';
import DOMElement from '../../components/layout/DOMElement';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const FeatureTradingScreen = (): ReactElement => {
  const [layout, setLayout] = useChange(({ persistent }: RootStore) => persistent, 'layout');
  const [existingSymbol, setSymbol] = useChange(({ persistent }: RootStore) => persistent, 'symbol');
  const theme = useValue(({ persistent }: RootStore) => persistent, 'theme');
  const customWidgets = useValue(({ app }: RootStore) => app, 'customWidgets');
  const futuresExchangeSymbols = Object.values(useValue(({ market }: RootStore) => market, 'futuresExchangeSymbols')).sort(((a, b) => (a.symbol > b.symbol ? 1 : -1)));

  const onLayoutChange = useCallback((changedLayout: Layout[] /* , changedLayouts: Layouts */) => {
    setLayout(changedLayout);
  }, [setLayout]);

  const resetLayout = useCallback(() => { setLayout([]); }, [setLayout]);

  return (
    <div>
      <SettingsModal />
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
            Reset Layout
          </Button>
          {' '}
          <SettingsButton />
        </div>
      </Navbar>

      <ResponsiveReactGridLayout
        draggableHandle=".card-header"
        className="layout"
        breakpoints={{
          lg: 100, md: 0, sm: 0, xs: 0, xxs: 0,
        }}
        cols={{
          lg: 12, md: 12, sm: 12, xs: 12, xxs: 12,
        }}
        rowHeight={30}
        layouts={{ lg: layout }}
        onLayoutChange={onLayoutChange}
      >
        <div
          key="chart"
          data-grid={{
            h: 13,
            minH: 3,
            minW: 2,
            w: 12,
            x: 0,
            y: 0,
          }}
        >
          <ChartWidget />
        </div>
        <div
          key="trading"
          data-grid={{
            h: 13,
            minH: 3,
            minW: 2,
            w: 9,
            x: 0,
            y: 17,
          }}
        >
          <TradingWidget />
        </div>
        <div
          key="positionAndOrders"
          data-grid={{
            h: 8,
            minH: 3,
            minW: 2,
            w: 12,
            x: 0,
            y: 30,
          }}
        >
          <PositionsAndOrdersWidget />
        </div>
        <div
          key="lastTrades"
          data-grid={{
            h: 6,
            minH: 3,
            minW: 2,
            w: 5,
            x: 0,
            y: 38,
          }}
        >
          <LastTradesWidget />
        </div>
        <div
          key="orderBook"
          data-grid={{
            h: 6,
            minH: 3,
            minW: 2,
            w: 7,
            x: 5,
            y: 38,
          }}
        >
          <OrderBookWidget />
        </div>
        <div
          key="wallet"
          data-grid={{
            h: 13,
            minH: 3,
            minW: 2,
            w: 3,
            x: 9,
            y: 17,
          }}
        >
          <WalletWidget />
        </div>
        {customWidgets.map(({
          title,
          id,
          hasSettings,
          settingsElement,
          element,
          noPadding,
          bodyClassName,
          shouldCheckAccount,
          onSettingsSave,
          onSettingsClose,
        }) => (
          <div
            key={`${id}_customWidget`}
            data-grid={{
              h: 13,
              minH: 3,
              minW: 2,
              w: 3,
              x: 9,
              y: 17,
            }}
          >
            <Widget
              title={title}
              settings={hasSettings ? <DOMElement>{settingsElement}</DOMElement> : null}
              noPadding={noPadding}
              bodyClassName={bodyClassName}
              shouldCheckAccount={shouldCheckAccount}
              onSettingsSave={onSettingsSave}
              onSettingsClose={onSettingsClose}
            >
              <DOMElement>{element}</DOMElement>
            </Widget>
          </div>
        ))}

      </ResponsiveReactGridLayout>
    </div>
  );
};

export default FeatureTradingScreen;
