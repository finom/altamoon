interface Flags {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    type?: 'TRADE' | 'SIGNED' | 'MARKET_DATA' | 'USER_DATA' | 'USER_STREAM';
    baseURL?: string;
}
interface Data {
    recvWindow?: number;
    timestamp?: number;
    signature?: string;
    [key: string]: number | string | boolean | undefined;
}
export default function promiseRequest<T>(url: string, data?: Data, flags?: Flags): Promise<T>;
export {};
//# sourceMappingURL=promiseRequest.d.ts.map