import type * as expressSession from "express-session";
export declare const markConvictionBatchAsSent: (batchID: number, requestSession: expressSession.Session) => boolean;
export default markConvictionBatchAsSent;