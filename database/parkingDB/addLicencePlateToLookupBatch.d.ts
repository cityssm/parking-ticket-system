import type * as expressSession from 'express-session';
import type { LicencePlateLookupBatch, LicencePlateLookupBatchEntry } from '../../types/recordTypes.js';
interface AddLicencePlateToLookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: LicencePlateLookupBatch;
}
export declare const addLicencePlateToLookupBatch: (requestBody: LicencePlateLookupBatchEntry, requestSession: expressSession.Session) => AddLicencePlateToLookupBatchReturn;
interface AddAllParkingTicketsToLookupBatchBody {
    batchID: number;
    ticketIDs: string[];
}
export declare const addAllParkingTicketsToLookupBatch: (requestBody: AddAllParkingTicketsToLookupBatchBody, requestSession: expressSession.Session) => AddLicencePlateToLookupBatchReturn;
export default addLicencePlateToLookupBatch;
