import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const removeLicencePlateFromLookupBatch: (requestBody: pts.LicencePlateLookupBatchEntry, requestSession: expressSession.Session) => {
    success: boolean;
    message?: string;
};
export default removeLicencePlateFromLookupBatch;
