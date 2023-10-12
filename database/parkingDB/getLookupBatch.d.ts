import type { LicencePlateLookupBatch } from '../../types/recordTypes.js';
export interface LookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: LicencePlateLookupBatch;
}
export declare const getLookupBatch: (batchID_or_negOne: number) => LicencePlateLookupBatch | undefined;
export default getLookupBatch;
