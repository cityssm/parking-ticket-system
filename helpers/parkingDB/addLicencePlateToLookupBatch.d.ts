import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
interface AddLicencePlateToLookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: pts.LicencePlateLookupBatch;
}
export declare const addLicencePlateToLookupBatch: (requestBody: pts.LicencePlateLookupBatchEntry, requestSession: expressSession.Session) => AddLicencePlateToLookupBatchReturn;
interface AddAllParkingTicketsToLookupBatchBody {
    batchID: number;
    ticketIDs: string[];
}
export declare const addAllParkingTicketsToLookupBatch: (requestBody: AddAllParkingTicketsToLookupBatchBody, requestSession: expressSession.Session) => AddLicencePlateToLookupBatchReturn;
export default addLicencePlateToLookupBatch;
