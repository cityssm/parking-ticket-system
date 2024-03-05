import type { LicencePlateLookupBatch } from '../../types/recordTypes.js';
export default function createConvictionBatch(sessionUser: PTSUser): {
    success: boolean;
    batch?: LicencePlateLookupBatch;
};
