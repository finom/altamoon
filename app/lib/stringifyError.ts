// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export default function stringifyError(error: any): string {
  return (error as { message?: string }).message ?? String(error || 'Unknown error');
}
