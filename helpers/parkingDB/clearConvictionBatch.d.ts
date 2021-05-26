import type * as expressSession from "express-session";
export declare const clearConvictionBatch: (batchID: number, reqSession: expressSession.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export default clearConvictionBatch;
