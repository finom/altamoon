import Binance from 'node-binance-api';

export default new Binance().options({
  APIKEY: '<key>',
  APISECRET: '<secret>',
});
