import Noty from 'noty';
import stringifyError from './stringifyError';

export default function showError(error: string | Error): void {
  new Noty({
    text: stringifyError(error),
    type: 'error',
  }).show();
}
