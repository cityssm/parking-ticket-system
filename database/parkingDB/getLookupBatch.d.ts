import type { LicencePlateLookupBatch } from '../../types/recordTypes.js';
export interface LookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: LicencePlateLookupBatch;
}
export default function getLookupBatch(batchId_or_negOne: number): LicencePlateLookupBatch | undefined;
