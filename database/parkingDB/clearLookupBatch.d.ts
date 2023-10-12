import type * as expressSession from 'express-session';
import type { LookupBatchReturn } from './getLookupBatch.js';
export declare const clearLookupBatch: (batchID: number, requestSession: expressSession.Session) => LookupBatchReturn;
export default clearLookupBatch;
