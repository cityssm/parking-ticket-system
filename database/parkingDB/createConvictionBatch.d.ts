import type { LicencePlateLookupBatch } from '../../types/recordTypes.js';
export declare const createConvictionBatch: (sessionUser: PTSUser) => {
    success: boolean;
    batch?: LicencePlateLookupBatch;
};
export default createConvictionBatch;
