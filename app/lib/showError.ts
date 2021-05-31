import Noty from 'noty';

export default function showError(error: string | Error): void {
  new Noty({
    text: error.toString(),
    type: 'error',
  }).show();
}
