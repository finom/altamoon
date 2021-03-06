declare module 'node-binance-api' {
  interface Options {
    APIKEY: string;
    APISECRET: string;
    useServerTime: boolean;
    recvWindow: number;
    verbose: boolean;
    log: (msg: string) => void;
  }

  class Binance {
    options: (options: Partial<Options>) => void;
  }
  export = Binance;
}
