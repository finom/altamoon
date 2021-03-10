import Binance from 'node-binance-api';
import { onChange } from '../hooks/useChange';
import store from './store';

const binance = new Binance();

const setOptions = () => {
  binance.options({
    APIKEY: String(store.persistent.binanceApiKey),
    APISECRET: String(store.persistent.binanceApiSecret),
  });
};

onChange(store.persistent, 'binanceApiKey', setOptions);
onChange(store.persistent, 'binanceApiSecret', setOptions);
setOptions();

export default binance;
