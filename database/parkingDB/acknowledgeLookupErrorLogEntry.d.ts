import type { Session } from 'express-session';
export declare function acknowledgeLookupErrorLogEntry(batchID: number, logIndex: number, requestSession: Session): boolean;
export default acknowledgeLookupErrorLogEntry;
