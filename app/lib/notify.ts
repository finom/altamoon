import Noty from 'noty';
import stringifyError from './stringifyError';

function notify(type: 'error', text: string | Error): void;
function notify(type: 'success' | 'alert', text: string): void;
function notify(type: 'error' | 'success' | 'alert', text: string | Error): void {
  new Noty({
    text: type === 'error' ? stringifyError(text) : text as string,
    type,
  }).show();
}

export default notify;
