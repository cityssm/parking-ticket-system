import type * as expressSession from "express-session";
interface LockConvictionBatchReturn {
    success: boolean;
    lockDate: number;
    lockDateString: string;
}
export declare const lockConvictionBatch: (batchID: number, requestSession: expressSession.Session) => LockConvictionBatchReturn;
export default lockConvictionBatch;
