import type { LicencePlateLookupBatch, LicencePlateLookupBatchEntry } from '../../types/recordTypes.js';
interface AddLicencePlateToLookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: LicencePlateLookupBatch;
}
export declare function addLicencePlateToLookupBatch(requestBody: LicencePlateLookupBatchEntry, sessionUser: PTSUser): AddLicencePlateToLookupBatchReturn;
export interface AddAllParkingTicketsToLookupBatchBody {
    batchId: number;
    ticketIds: string[];
}
export declare function addAllParkingTicketsToLookupBatch(requestBody: AddAllParkingTicketsToLookupBatchBody, sessionUser: PTSUser): AddLicencePlateToLookupBatchReturn;
export default addLicencePlateToLookupBatch;
