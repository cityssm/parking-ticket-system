import type * as expressSession from 'express-session';
import type { LicencePlateLookupBatch } from '../../types/recordTypes.js';
export declare const createConvictionBatch: (requestSession: expressSession.Session) => {
    success: boolean;
    batch?: LicencePlateLookupBatch;
};
export default createConvictionBatch;
