interface Options {
  apiKey: string;
  apiSecret: string;
  recvWindow: number;
}

const options: Partial<Options> = {};

export default options;

export function setOptions(opts: Partial<Options>): void {
  Object.assign(options, opts);
}
