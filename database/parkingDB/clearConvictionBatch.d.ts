import type * as expressSession from 'express-session';
export declare const clearConvictionBatch: (batchID: number, requestSession: expressSession.Session) => {
    success: boolean;
    message?: string;
};
export default clearConvictionBatch;
