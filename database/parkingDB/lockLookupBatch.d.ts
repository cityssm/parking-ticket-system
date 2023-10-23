import type { LookupBatchReturn } from './getLookupBatch.js';
export declare const lockLookupBatch: (batchID: number, sessionUser: PTSUser) => LookupBatchReturn;
export default lockLookupBatch;
