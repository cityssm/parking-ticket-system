import type * as expressSession from "express-session";
export declare const lockConvictionBatch: (batchID: number, reqSession: expressSession.Session) => {
    success: boolean;
    lockDate: number;
    lockDateString: string;
};
export default lockConvictionBatch;
