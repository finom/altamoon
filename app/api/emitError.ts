export default function emitError(error: Error | string): void {
  window.dispatchEvent(new CustomEvent('binance-api-error', {
    detail: { error },
  }));
}
