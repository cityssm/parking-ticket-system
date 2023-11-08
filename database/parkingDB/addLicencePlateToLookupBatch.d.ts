import type { LicencePlateLookupBatch, LicencePlateLookupBatchEntry } from '../../types/recordTypes.js';
interface AddLicencePlateToLookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: LicencePlateLookupBatch;
}
export declare const addLicencePlateToLookupBatch: (requestBody: LicencePlateLookupBatchEntry, sessionUser: PTSUser) => AddLicencePlateToLookupBatchReturn;
interface AddAllParkingTicketsToLookupBatchBody {
    batchId: number;
    ticketIds: string[];
}
export declare const addAllParkingTicketsToLookupBatch: (requestBody: AddAllParkingTicketsToLookupBatchBody, sessionUser: PTSUser) => AddLicencePlateToLookupBatchReturn;
export default addLicencePlateToLookupBatch;
