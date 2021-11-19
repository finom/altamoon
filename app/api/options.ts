interface Options {
  apiKey: string;
  apiSecret: string;
  isTestnet: boolean;
  recvWindow: number;
  readonly wsURL: string;
  readonly apiURL: string;
  readonly accountStreamURL: string;
}

const options: Partial<Options> & Pick<Options, 'wsURL' | 'apiURL' | 'accountStreamURL'> = {
  get wsURL() {
    return this.isTestnet ? 'wss://stream.binancefuture.com/' : 'wss://fstream.binance.com/stream';
  },
  get apiURL() {
    return this.isTestnet ? 'https://testnet.binancefuture.com/fapi/' : 'https://fapi.binance.com/fapi/';
  },
  get accountStreamURL() {
    return this.isTestnet ? 'wss://stream.binancefuture.com/ws/' : 'wss://fstream.binance.com/ws/';
  },
};

export default options;

export function setOptions(opts: Partial<Options>): void {
  Object.assign(options, opts);
}
