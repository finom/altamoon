import * as bootstrap from 'bootstrap';

export default function tooltipRef(
  options?: Partial<bootstrap.Tooltip.Options>,
  ref?: (instance: bootstrap.Tooltip | null) => void,
): ((element: null | HTMLElement) => void) {
  return (element: null | HTMLElement): void => {
    const instance = element && bootstrap.Tooltip.getInstance(element);
    if (element && !instance) {
      // eslint-disable-next-line no-new
      new bootstrap.Tooltip(element, { html: true, ...options });
    }

    ref?.(instance);
  };
}
