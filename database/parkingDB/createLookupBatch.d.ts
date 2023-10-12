import type * as expressSession from 'express-session';
import type { LicencePlateLookupBatch } from '../../types/recordTypes.js';
interface CreateLookupBatchForm {
    mto_includeLabels?: '1' | '0';
}
export declare const createLookupBatch: (requestBody: CreateLookupBatchForm, requestSession: expressSession.Session) => {
    success: boolean;
    batch?: LicencePlateLookupBatch;
};
export default createLookupBatch;
