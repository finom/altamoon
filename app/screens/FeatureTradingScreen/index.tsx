import React, { ReactElement, useCallback } from 'react';
import { WidthProvider, Responsive, Layout } from 'react-grid-layout';
import { Button, Input, Navbar } from 'reactstrap';
import { Gear } from 'react-bootstrap-icons';
import classNames from 'classnames';
import { SettingsModal } from '../../components';
import LastTradesWidget from '../../components/widgets/LastTradesWidget';
import useChange, { useSet, useValue } from '../../hooks/useChange';
import { RootStore } from '../../store';
import { darkTheme, defaultTheme } from '../../themes';
import css from './style.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const FeatureTradingScreen = (): ReactElement => {
  const [layout, setLayout] = useChange(({ persistent }: RootStore) => persistent, 'layout');
  const [existingSymbol, setSymbol] = useChange(({ persistent }: RootStore) => persistent, 'symbol');
  const [theme] = useChange(({ persistent }: RootStore) => persistent, 'theme');
  const futuresExchangeSymbols = useValue(({ market }: RootStore) => market, 'futuresExchangeSymbols');

  const setIsSettingsModalOpen = useSet((store: RootStore) => store, 'isSettingsModalOpen');

  const onLayoutChange = useCallback((changedLayout: Layout[] /* , changedLayouts: Layouts */) => {
    setLayout(changedLayout);
  }, [setLayout]);

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
            onClick={() => setIsSettingsModalOpen(true)}
            color={theme === 'dark' ? 'dark' : 'light'}
          >
            <Gear size={16} />
            {' '}
            Settings
          </Button>

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
          key="lastTrades"
          data-grid={{
            w: 3, h: 3, x: 0, y: 0, minW: 2, minH: 3,
          }}
        >
          <LastTradesWidget />
        </div>
      </ResponsiveReactGridLayout>
    </div>
  );
};

export default FeatureTradingScreen;
