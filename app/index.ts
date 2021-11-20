export { default } from './Root';

// types for altamoon-types
export * from './api/types';
export * from './store/types';
export { RootStore } from './store';

const logo = document.querySelector<HTMLImageElement>('#loading-logo');
if (logo) logo.style.display = 'none';
