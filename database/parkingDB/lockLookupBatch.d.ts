import type { LookupBatchReturn } from "./getLookupBatch";
import type * as expressSession from "express-session";
export declare const lockLookupBatch: (batchID: number, requestSession: expressSession.Session) => LookupBatchReturn;
export default lockLookupBatch;
