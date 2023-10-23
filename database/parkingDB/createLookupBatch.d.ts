import type { LicencePlateLookupBatch } from '../../types/recordTypes.js';
interface CreateLookupBatchForm {
    mto_includeLabels?: '1' | '0';
}
export declare const createLookupBatch: (requestBody: CreateLookupBatchForm, sessionUser: PTSUser) => {
    success: boolean;
    batch?: LicencePlateLookupBatch;
};
export default createLookupBatch;
