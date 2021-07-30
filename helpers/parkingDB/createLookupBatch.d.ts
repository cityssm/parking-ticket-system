import type * as expressSession from "express-session";
import type * as recordTypes from "../../types/recordTypes";
export declare const createLookupBatch: (requestSession: expressSession.Session) => {
    success: boolean;
    batch?: recordTypes.LicencePlateLookupBatch;
};
export default createLookupBatch;
