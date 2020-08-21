import type * as pts from "../ptsTypes";
export interface LookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: pts.LicencePlateLookupBatch;
}
export declare const getLookupBatch: (batchID_or_negOne: number) => pts.LicencePlateLookupBatch;
