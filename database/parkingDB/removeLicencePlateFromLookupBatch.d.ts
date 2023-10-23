import type { LicencePlateLookupBatchEntry } from '../../types/recordTypes.js';
export declare const removeLicencePlateFromLookupBatch: (requestBody: LicencePlateLookupBatchEntry, sessionUser: PTSUser) => {
    success: boolean;
    message?: string;
};
export default removeLicencePlateFromLookupBatch;
