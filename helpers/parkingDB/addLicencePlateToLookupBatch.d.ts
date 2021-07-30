import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
interface AddLicencePlateToLookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: pts.LicencePlateLookupBatch;
}
export declare const addLicencePlateToLookupBatch: (requestBody: pts.LicencePlateLookupBatchEntry, requestSession: expressSession.Session) => AddLicencePlateToLookupBatchReturn;
interface AddAllLicencePlatesToLookupBatchBody {
    batchID: number;
    licencePlateCountry: string;
    licencePlateProvince: string;
    licencePlateNumbers: Array<[string, number]>;
}
export declare const addAllLicencePlatesToLookupBatch: (requestBody: AddAllLicencePlatesToLookupBatchBody, requestSession: expressSession.Session) => AddLicencePlateToLookupBatchReturn;
export default addLicencePlateToLookupBatch;
