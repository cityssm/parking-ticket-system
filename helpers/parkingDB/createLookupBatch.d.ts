/// <reference types="integer" />
import type * as expressSession from "express-session";
export declare const createLookupBatch: (reqSession: expressSession.Session) => {
    success: boolean;
    batch: {
        batchID: import("integer").IntLike;
        batchDate: number;
        batchDateString: string;
        lockDate: any;
        lockDateString: string;
        batchEntries: any[];
    };
} | {
    success: boolean;
    batch?: undefined;
};
export default createLookupBatch;
