import classNames from 'classnames';
import React, { ReactElement, useMemo, useState } from 'react';
import { Button, Input, Navbar } from 'reactstrap';
import useChange, { useValue } from 'use-change';
import { Puzzle } from 'react-bootstrap-icons';

import formatMoneyNumber from '../../../lib/formatMoneyNumber';
import { RootStore, PERSISTENT, MARKET } from '../../../store';
import css from './style.css';
import SettingsButton from '../../../components/controls/SettingsButton';
import WidgetsSelect from '../../../components/widgets/WidgetsSelect';
import SettingsModal from '../../../components/modals/SettingsModal';
import PluginsModal from '../../../components/modals/PluginsModal';
import useValueDebounced from '../../../hooks/useValueDebounced';
import Layouts from './Layouts';

const Headbar = (): ReactElement => {
  const [symbol, setSymbol] = useChange(PERSISTENT, 'symbol');
  const futuresExchangeSymbols = useValue(MARKET, 'futuresExchangeSymbols');
  const theme = useValue(PERSISTENT, 'theme');
  const currentSymbolLastPrice = useValueDebounced(MARKET, 'currentSymbolLastPrice', 1000);
  const priceDirection = useValue(MARKET, 'priceDirection');
  const currentSymbolInfo = useValue(MARKET, 'currentSymbolInfo');
  const [isPluginsModalOpen, setIsPluginsModalOpen] = useState(false);
  const perpetualSymbols = useMemo(() => Object.values(futuresExchangeSymbols)
    .filter(({ contractType }) => contractType === 'PERPETUAL')
    .sort(((a, b) => (a.symbol > b.symbol ? 1 : -1))), [futuresExchangeSymbols]);

  const ticker = useValueDebounced(
    ({ market }: RootStore) => market.allSymbolsTickers, symbol,
  );
  const markPriceTicker = useValueDebounced(
    ({ market }: RootStore) => market.allMarkPriceTickers, symbol,
  );
  const lastPrice = currentSymbolInfo && currentSymbolLastPrice
    ? currentSymbolLastPrice.toFixed(currentSymbolInfo.pricePrecision)
    : null;
  const markPrice = currentSymbolInfo && markPriceTicker
    ? (+markPriceTicker.markPrice).toFixed(currentSymbolInfo.pricePrecision)
    : null;
  const indexPrice = currentSymbolInfo && markPriceTicker
    ? (+markPriceTicker.indexPrice).toFixed(currentSymbolInfo.pricePrecision)
    : null;
  const fundingRateStr = markPriceTicker
    ? `${(+markPriceTicker.fundingRate * 100).toFixed(4)}%`
    : null;
  const countdown = useMemo(() => {
    if (!markPriceTicker) return null;
    const now = new Date().getTime();

    // Find the distance between now and the count down date
    const distance = markPriceTicker.fundingTime - now;
    const zeros = (n: number) => `0${n}`.slice(-2);

    // Time calculations for days, hours, minutes and seconds
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${zeros(hours)}:${zeros(minutes)}:${zeros(seconds)}`;
  }, [markPriceTicker]);

  return (
    <Navbar
      className={classNames({
        [css.navbar]: true,
        'bg-dark': theme === 'dark',
        'bg-light': theme !== 'dark',
        'p-3': true,
        'justify-content-start': true,
      })}
    >
      <SettingsModal />
      <PluginsModal
        isOpen={isPluginsModalOpen}
        onRequestClose={() => setIsPluginsModalOpen(false)}
      />
      <Input className={`${css.symbol} form-control`} type="select" value={symbol} onChange={({ target }) => setSymbol(target.value)}>
        {perpetualSymbols.length
          ? perpetualSymbols.map(({ symbol: sym, baseAsset, quoteAsset }) => (
            <option key={sym} value={sym}>
              {baseAsset}
              /
              {quoteAsset}
            </option>
          )) : <option>Loading...</option>}
      </Input>
      <div className={`fs-5${lastPrice && priceDirection === 'UP' ? ' text-success' : ''}${lastPrice && priceDirection === 'DOWN' ? ' text-danger' : ''} px-3`}>
        {lastPrice ?? '...'}
      </div>
      <div className={css.marketInfo}>
        <span className={`${css.label} text-muted`}>Mark</span>
        <span className={css.text}>{markPrice ?? '...'}</span>
      </div>
      <div className={css.marketInfo}>
        <span className={`${css.label} text-muted`}>Index</span>
        <span className={css.text}>{indexPrice ?? '...'}</span>
      </div>
      <div className={css.marketInfo}>
        <span className={`${css.label} text-muted`}>Funding / Countdown</span>
        <span className={css.text}>
          {fundingRateStr ?? '...'}
          {' '}
          &nbsp;
          {' '}
          {countdown ?? '...'}
        </span>
      </div>
      <div className={css.marketInfo}>
        <span className={`${css.label} text-muted`}>24h Change</span>
        <span className={css.text + ((!!+ticker?.priceChange && (+ticker.priceChange > 0 ? ' text-success' : ' text-danger')) || '')}>
          {ticker?.priceChange ?? '...'}
          {' '}
          &nbsp;
          {ticker ? (+ticker.priceChangePercent > 0 ? '+' : '') + ticker.priceChangePercent : '...'}
          %
        </span>
      </div>
      <div className={css.marketInfo}>
        <span className={`${css.label} text-muted`}>24h High</span>
        <span className={css.text}>{ticker?.high ?? '...'}</span>
      </div>
      <div className={css.marketInfo}>
        <span className={`${css.label} text-muted`}>24h Low</span>
        <span className={css.text}>{ticker?.low ?? '...'}</span>
      </div>
      <div className={css.marketInfo}>
        <span className={`${css.label} text-muted`}>
          24h vol (
          {symbol.replace(/USDT|BUSD/, '')}
          )
        </span>
        <span className={css.text}>{ticker ? formatMoneyNumber(+ticker.volume) : '...'}</span>
      </div>
      <div className={css.marketInfo}>
        <span className={`${css.label} text-muted`}>24h vol (USDT)</span>
        <span className={css.text}>{ticker ? formatMoneyNumber(+ticker.quoteVolume) : '...'}</span>
      </div>
      <Layouts className={css.layoutsWrapper} />
      {' '}
      <SettingsButton buttonTextClassName="d-none d-xxl-inline-block" />
      {' '}
      <Button
        title="Plugins"
        color={theme === 'dark' ? 'dark' : 'light'}
        onClick={() => setIsPluginsModalOpen(true)}
      >
        <Puzzle size={16} />
        {' '}
        <span className="d-none d-xxl-inline-block">Plugins</span>
      </Button>
      <WidgetsSelect buttonTextClassName="d-none d-xxl-inline-block " />
    </Navbar>
  );
};

export default Headbar;
