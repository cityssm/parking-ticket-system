/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import type { LookupBatchReturn } from "./getLookupBatch";
export declare const clearLookupBatch: (batchID: number, reqSession: Express.Session) => LookupBatchReturn;
