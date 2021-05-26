import type * as expressSession from "express-session";
export declare const acknowledgeLookupErrorLogEntry: (batchID: number, logIndex: number, reqSession: expressSession.Session) => boolean;
export default acknowledgeLookupErrorLogEntry;
