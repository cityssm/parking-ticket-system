import type { LookupBatchReturn } from "./getLookupBatch.js";
import type * as expressSession from "express-session";
export declare const clearLookupBatch: (batchID: number, requestSession: expressSession.Session) => LookupBatchReturn;
export default clearLookupBatch;
