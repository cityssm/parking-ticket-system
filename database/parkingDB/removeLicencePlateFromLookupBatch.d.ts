import type { LicencePlateLookupBatchEntry } from '../../types/recordTypes.js';
export default function removeLicencePlateFromLookupBatch(requestBody: LicencePlateLookupBatchEntry, sessionUser: PTSUser): {
    success: boolean;
    message?: string;
};
