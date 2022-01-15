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
  recvWindow: 20000,
  get wsURL() {
    return this.isTestnet ? 'wss://stream.binancefuture.com/stream' : 'wss://fstream.binance.com/stream';
  },
  get apiURL() {
    return this.isTestnet ? 'https://testnet.binancefuture.com/fapi/' : 'https://fapi.binance.com/fapi/';
  },
  get accountStreamURL() {
    return this.isTestnet ? 'wss://stream.binancefuture.com/ws/' : 'wss://fstream.binance.com/ws/';
  },
};

export default options;

/**
 *
 * @param options - Global options
 * @param options.apiKey - API key
 * @param options.apiSecret - API secret
 * @param options.isTestnet - Use testnet
 * @param options.recvWindow - Time window
 */
export function setOptions(opts: Partial<Options>): void {
  Object.assign(options, opts);
}
