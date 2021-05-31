import React, { ReactElement, useCallback } from 'react';
import { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import { Button, Input, Navbar } from 'reactstrap';
import classNames from 'classnames';
import useChange, { useValue } from 'use-change';

import LastTradesWidget from '../../components/widgets/LastTradesWidget';
import { RootStore } from '../../store';
import { darkTheme, defaultTheme } from '../../themes';
import css from './style.css';
import OrderBookWidget from '../../components/widgets/OrderBookWidget';
import WalletWidget from '../../components/widgets/WalletWidget';
import ChartWidget from '../../components/widgets/ChartWidget';
import TradingWidget from '../../components/widgets/TradingWidget';
import SettingsModal from '../../components/SettingsModal';
import SettingsButton from '../../components/controls/SettingsButton';
import PositionsAndOrdersWidget from '../../components/widgets/PositionsAndOrdersWidget';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const FeatureTradingScreen = (): ReactElement => {
  const [layout, setLayout] = useChange(({ persistent }: RootStore) => persistent, 'layout');
  const [existingSymbol, setSymbol] = useChange(({ persistent }: RootStore) => persistent, 'symbol');
  const theme = useValue(({ persistent }: RootStore) => persistent, 'theme');
  const futuresExchangeSymbols = useValue(({ market }: RootStore) => market, 'futuresExchangeSymbols');

  const onLayoutChange = useCallback((changedLayout: Layout[] /* , changedLayouts: Layouts */) => {
    setLayout(changedLayout);
  }, [setLayout]);

  const resetLayout = useCallback(() => { setLayout([]); }, [setLayout]);

  return (
    <div>
      <SettingsModal />
      {theme === 'dark' ? <style>{darkTheme}</style> : <style>{defaultTheme}</style>}
      <Navbar className={classNames({
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
            w: 3, h: 3, x: 0, y: 0, minW: 2, minH: 3,
          }}
        >
          <ChartWidget />
        </div>
        <div
          key="trading"
          data-grid={{
            w: 3, h: 3, x: 0, y: 0, minW: 2, minH: 3,
          }}
        >
          <TradingWidget />
        </div>
        <div
          key="positionAndOrders"
          data-grid={{
            w: 3, h: 3, x: 0, y: 0, minW: 2, minH: 3,
          }}
        >
          <PositionsAndOrdersWidget />
        </div>
        <div
          key="lastTrades"
          data-grid={{
            w: 3, h: 3, x: 0, y: 0, minW: 2, minH: 3,
          }}
        >
          <LastTradesWidget />
        </div>
        <div
          key="orderBook"
          data-grid={{
            w: 3, h: 3, x: 0, y: 0, minW: 2, minH: 3,
          }}
        >
          <OrderBookWidget />
        </div>
        <div
          key="wallet"
          data-grid={{
            w: 3, h: 3, x: 0, y: 0, minW: 2, minH: 3,
          }}
        >
          <WalletWidget />
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
};

export default FeatureTradingScreen;
