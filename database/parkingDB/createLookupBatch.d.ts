import type { LicencePlateLookupBatch } from '../../types/recordTypes.js';
export interface CreateLookupBatchForm {
    mto_includeLabels?: '1' | '0';
}
export default function createLookupBatch(requestBody: CreateLookupBatchForm, sessionUser: PTSUser): {
    success: boolean;
    batch?: LicencePlateLookupBatch;
};
