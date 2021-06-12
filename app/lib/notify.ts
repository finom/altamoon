import Noty from 'noty';
import stringifyError from './stringifyError';

function notify(type: 'error', text: string | Error): void;
function notify(type: 'success' | 'alert', text: string): void;
function notify(type: 'error' | 'success' | 'alert', text: string | Error): void {
  new Noty({
    text: type === 'error' ? stringifyError(text) : text as string,
    type,
    timeout: type === 'error' ? 5000 : 2000,
    layout: 'bottomRight',
  }).show();
}

export default notify;
