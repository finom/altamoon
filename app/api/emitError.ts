export default function emitError(error: Error | string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('binance-api-error', {
      detail: { error },
    }));
  }
}
