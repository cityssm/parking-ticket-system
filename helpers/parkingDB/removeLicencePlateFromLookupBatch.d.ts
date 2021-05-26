import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const removeLicencePlateFromLookupBatch: (reqBody: pts.LicencePlateLookupBatchEntry, reqSession: expressSession.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export default removeLicencePlateFromLookupBatch;
