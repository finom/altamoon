declare type Result = Record<string, {
    available: number;
    locked: number;
}>;
export declare function balance(): Promise<Result>;
interface TransferOptions {
    asset: string;
    amount: number;
    isFromSpotToFutures: boolean;
}
export declare function transfer({ asset, amount, isFromSpotToFutures, }: TransferOptions): Promise<{
    tranId: number;
}>;
export {};
//# sourceMappingURL=spot.d.ts.map