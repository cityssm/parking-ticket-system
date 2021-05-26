import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
interface AddLicencePlateToLookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: pts.LicencePlateLookupBatch;
}
export declare const addLicencePlateToLookupBatch: (reqBody: pts.LicencePlateLookupBatchEntry, reqSession: expressSession.Session) => AddLicencePlateToLookupBatchReturn;
interface AddAllLicencePlatesToLookupBatchBody {
    batchID: number;
    licencePlateCountry: string;
    licencePlateProvince: string;
    licencePlateNumbers: Array<[string, number]>;
}
export declare const addAllLicencePlatesToLookupBatch: (reqBody: AddAllLicencePlatesToLookupBatchBody, reqSession: expressSession.Session) => {
    success: boolean;
    message: string;
    batch?: undefined;
} | {
    success: boolean;
    batch: pts.LicencePlateLookupBatch;
    message?: undefined;
};
export default addLicencePlateToLookupBatch;
