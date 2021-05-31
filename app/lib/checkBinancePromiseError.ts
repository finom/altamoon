import showError from './showError';

export default function checkBinancePromiseError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resp: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  { show = true }: { show?: boolean } = {},
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const isError = !!resp && 'code' in resp && 'msg' in resp && resp.msg !== 'success';

  if (show && isError) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    showError(resp.msg as string);
  }

  return isError;
}
