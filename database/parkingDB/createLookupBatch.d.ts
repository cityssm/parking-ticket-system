import type * as expressSession from "express-session";
import type * as recordTypes from "../../types/recordTypes";
interface CreateLookupBatchForm {
    mto_includeLabels?: "1" | "0";
}
export declare const createLookupBatch: (requestBody: CreateLookupBatchForm, requestSession: expressSession.Session) => {
    success: boolean;
    batch?: recordTypes.LicencePlateLookupBatch;
};
export default createLookupBatch;
